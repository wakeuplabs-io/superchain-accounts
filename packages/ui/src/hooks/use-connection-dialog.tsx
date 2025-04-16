import { useCallback } from "react";
import { getWalletKit, Transaction } from "@/lib/wallet-connect";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { ProposalTypes } from "@walletconnect/types";
import { hexToString } from "viem";
import { DialogType, encodedTransaction } from "@/lib/wallet-connect";
import {
  SUPPORTED_CHAINS,
  SUPPORTED_EVENTS,
  SUPPORTED_METHODS,
} from "@/config/wallet-connect";
import { sepolia } from "viem/chains";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { useWalletConnect } from "./use-wallet-connect";

// TODO: DEMO ONLY

import {
  generatePrivateKey,
  privateKeyToAccount,
  privateKeyToAddress,
} from "viem/accounts";
import {
  Account,
  createPublicClient,
  createWalletClient,
  decodeFunctionData,
  erc20Abi,
  formatUnits,
  http,
  WalletClient,
} from "viem";

let privateKey: `0x${string}` = generatePrivateKey();

export function getAddress(): string {
  return privateKeyToAddress(privateKey);
}

export async function getBalance(): Promise<string> {
  const publicClient = createPublicClient({
    transport: http(),
    chain: sepolia,
  });

  const balance = await publicClient.getBalance({
    address: getAddress() as `0x${string}`,
  });

  return formatUnits(balance, 18);
}

// Returns the wallet account from the private key
export function getWalletAccount(): Account {
  return privateKeyToAccount(privateKey);
}

export function decodeTransaction(
  transaction: encodedTransaction
): Transaction {
  const functionCall = decodeFunctionData({
    abi: erc20Abi,
    data: transaction.data as `0x${string}`,
  });

  return {
    to: functionCall.args[0] as `0x${string}`,
    amount: functionCall.args[1] as bigint,
  };
}

export const estimateGas = async (transaction: encodedTransaction) => {
  const publicClient = createPublicClient({
    transport: http(),
    chain: sepolia,
  });
  const gas = await publicClient.estimateGas({
    to: transaction.to as `0x${string}`,
    data: transaction.data as `0x${string}`,
    account: getWalletAccount(),
  });
  return gas;
};

export const getUsdcBalance = async () => {
  const publicClient = createPublicClient({
    transport: http(),
    chain: sepolia,
  });

  const usdcBalance = await publicClient.readContract({
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [getAddress() as `0x${string}`],
  });

  return Number(formatUnits(usdcBalance, 6)).toFixed(2);
};

// Returns the wallet client which can be used to perform operations with the wallet
export function getWalletClient(): WalletClient {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    transport: http(),
    chain: sepolia,
  });
}

// TODO: DEMO ONLY END

export function useConnectionDialog(onOpenChange: (open: boolean) => void) {
  const { data, setActiveSessions } = useWalletConnect();
  const walletKit = getWalletKit();

  // Called when the user approves the connection proposal
  const handleApproveProposal = useCallback(async () => {
    try {
      const address = getAddress();
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: data.proposal?.params as ProposalTypes.Struct,
        supportedNamespaces: {
          eip155: {
            chains: SUPPORTED_CHAINS,
            methods: SUPPORTED_METHODS,
            events: SUPPORTED_EVENTS,
            accounts: [`eip155:84532:${address}`], // TODO:
          },
        },
      });

      // Approve the session
      await walletKit.approveSession({
        id: data.proposal?.id as number,
        namespaces: approvedNamespaces,
      });
      // Update the active sessions after approval
      setActiveSessions(walletKit.getActiveSessions());
      toast({
        title: "Connection Approved",
        description: "You can now use the app",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error approving session:", error);
      await handleRejectProposal();
    }
  }, [data.proposal, walletKit, onOpenChange]);

  // Called when the user approves the sign request
  const handleApproveSignRequest = useCallback(async () => {
    try {
      const client = getWalletClient();

      console.log("request", data.requestEvent);

      if (data.requestEvent?.params?.request?.method === "personal_sign") {
        // Get the message to sign
        const requestParamsMessage =
          data.requestEvent?.params?.request?.params[0];

        // Convert the message to a string
        const message = hexToString(requestParamsMessage);

        // Sign the message
        const signature = await client.signMessage({
          message,
          account: getWalletAccount(),
        });

        // Respond to the session request with the signature
        await walletKit.respondSessionRequest({
          topic: data.requestEvent?.topic as string,
          response: {
            id: data.requestEvent?.id as number,
            result: signature,
            jsonrpc: "2.0",
          },
        });

        console.log("response", {
          id: data.requestEvent?.id as number,
          result: signature,
          jsonrpc: "2.0",
        });
        onOpenChange(false);
        toast({
          title: "Message signed",
          description: "Message signed successfully",
        });
      } else if (
        data.requestEvent?.params?.request?.method === "eth_sendTransaction"
      ) {
        const transaction = data.requestEvent?.params?.request
          ?.params[0] as encodedTransaction;
        const walletClient = getWalletClient();

        const gas = await estimateGas(transaction);

        const txn = await walletClient.sendTransaction({
          to: transaction.to as `0x${string}`,
          data: transaction.data as `0x${string}`,
          account: getWalletAccount(),
          gas: gas,
          chain: sepolia,
        });

        await walletKit.respondSessionRequest({
          topic: data.requestEvent?.topic as string,
          response: {
            id: data.requestEvent?.id as number,
            result: txn,
            jsonrpc: "2.0",
          },
        });

        toast({
          title: "Transaction sent",
          description: "Transaction sent successfully",
        });

        const queryClient = new QueryClient();
        queryClient.invalidateQueries({ queryKey: ["balances"] });

        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error responding to session request:", error);
      toast({
        title: "Error",
        description: "Error responding to session request",
      });
    }
  }, [data.requestEvent, walletKit, onOpenChange]);

  // Called when the user rejects the connection proposal
  const handleRejectProposal = useCallback(async () => {
    console.log("rejecting proposal", data.proposal);
    try {
      // Reject the session proposal with the user rejected reason
      await walletKit.rejectSession({
        id: data.proposal?.id as number,
        reason: getSdkError("USER_REJECTED"),
      });
      toast({
        title: "Connection Rejected",
        description: "Connection rejected",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error rejecting session:", error);
      toast({
        title: "Error",
        description: "Error rejecting session",
      });
    }
  }, [data.proposal, walletKit, onOpenChange]);

  const handleRejectRequest = useCallback(async () => {
    console.log("rejecting request", data.requestEvent);
    try {
      const response = {
        id: data.requestEvent?.id as number,
        jsonrpc: "2.0",
        error: {
          code: 5000,
          message: "User rejected.",
        },
      };

      await walletKit.respondSessionRequest({
        topic: data.requestEvent?.topic as string,
        response,
      });
      onOpenChange(false);
      toast({
        title: "Request Rejected",
        description: "Request rejected",
      });
    } catch (error) {
      console.error("Error rejecting a request:", error);
      toast({
        title: "Error",
        description: "Error rejecting a request",
      });
    }
  }, [data.requestEvent, walletKit, onOpenChange]);

  return {
    handleApproveProposal,
    handleApproveSignRequest,
    handleRejectProposal,
    handleRejectRequest,
  };
}
