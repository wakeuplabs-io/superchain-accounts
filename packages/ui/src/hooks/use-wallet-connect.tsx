import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { SessionTypes, SignClientTypes } from "@walletconnect/types";
import { useCallback } from "react";
import { getWalletKit, Transaction } from "@/lib/wallet-connect";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { ProposalTypes } from "@walletconnect/types";
import { Address, Hex, hexToString } from "viem";
import { encodedTransaction } from "@/lib/wallet-connect";
import {
  SUPPORTED_CHAINS,
  SUPPORTED_EVENTS,
  SUPPORTED_METHODS,
} from "@/config/wallet-connect";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { IWalletKit } from "@reown/walletkit";
import { useSuperChainAccount } from "./use-smart-account";

interface ModalData {
  proposal?: SignClientTypes.EventArguments["session_proposal"];
  requestEvent?: SignClientTypes.EventArguments["session_request"];
  requestSession?: SessionTypes.Struct;
  loadingMessage?: string;
  authRequest?: SignClientTypes.EventArguments["session_authenticate"];
  txnData?: Transaction;
}

interface WalletContextProps {
  data: ModalData;
  setData: (data: ModalData) => void;
  activeSessions: Record<string, SessionTypes.Struct>;
  setActiveSessions: (sessions: Record<string, SessionTypes.Struct>) => void;
  handleApproveProposal: () => Promise<void>;
  handleApproveSignRequest: () => Promise<void>;
  handleRejectProposal: () => Promise<void>;
  handleRejectRequest: () => Promise<void>;
  handleConnect: (uri: string) => Promise<void>;
  walletKit: IWalletKit | null;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletConnectProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [walletKit, setWalletKit] = useState<IWalletKit | null>(null);
  const [data, setData] = useState<ModalData>({});
  const [activeSessions, setActiveSessions] = useState<
    Record<string, SessionTypes.Struct>
  >({});
  const { account, signMessage, sendTransaction } = useSuperChainAccount();

  useEffect(() => {
    if (!walletKit) {
      getWalletKit().then(setWalletKit);
    }
  }, [walletKit]);

  // Called when the user approves the connection proposal
  const handleApproveProposal = useCallback(async () => {
    try {
      if (walletKit === null) {
        throw new Error("WalletKit not initialized");
      }

      const address = account.address;
      const approvedNamespaces = buildApprovedNamespaces({
        proposal: data.proposal?.params as ProposalTypes.Struct,
        supportedNamespaces: {
          eip155: {
            chains: SUPPORTED_CHAINS,
            methods: SUPPORTED_METHODS,
            events: SUPPORTED_EVENTS,
            accounts: SUPPORTED_CHAINS.map((chain) => `${chain}:${address}`),
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
    } catch (error) {
      console.error("Error approving session:", error);
      await handleRejectProposal();
    }
  }, [data.proposal, walletKit]);

  // Called when the user approves the sign request
  const handleApproveSignRequest = useCallback(async () => {
    try {
      if (walletKit === null) {
        throw new Error("WalletKit not initialized");
      }

      if (data.requestEvent?.params?.request?.method === "personal_sign") {
        // Get the message to sign
        const requestParamsMessage =
          data.requestEvent?.params?.request?.params[0];

        // Convert the message to a string
        const message = hexToString(requestParamsMessage);

        // Sign the message
        const signature = await signMessage(message);

        // Respond to the session request with the signature
        await walletKit.respondSessionRequest({
          topic: data.requestEvent?.topic as string,
          response: {
            id: data.requestEvent?.id as number,
            result: signature,
            jsonrpc: "2.0",
          },
        });

        toast({
          title: "Message signed",
          description: "Message signed successfully",
        });
      } else if (
        data.requestEvent?.params?.request?.method === "eth_sendTransaction"
      ) {
        const transaction = data.requestEvent?.params?.request
          ?.params[0] as encodedTransaction;

        const txn = await sendTransaction({
          to: transaction.to as Address,
          value: BigInt(transaction.value ?? "0"),
          data: transaction.data as Hex,
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
      }
    } catch (error) {
      console.error("Error responding to session request:", error);
      toast({
        title: "Error",
        description: "Error responding to session request",
      });
    }
  }, [data.requestEvent, walletKit]);

  // Called when the user rejects the connection proposal
  const handleRejectProposal = useCallback(async () => {
    try {
      if (walletKit === null) {
        throw new Error("WalletKit not initialized");
      }

      // Reject the session proposal with the user rejected reason
      await walletKit.rejectSession({
        id: data.proposal?.id as number,
        reason: getSdkError("USER_REJECTED"),
      });
      toast({
        title: "Connection Rejected",
        description: "Connection rejected",
      });
    } catch (error) {
      console.error("Error rejecting session:", error);
      toast({
        title: "Error",
        description: "Error rejecting session",
      });
    }
  }, [data.proposal, walletKit]);

  const handleRejectRequest = useCallback(async () => {
    try {
      if (walletKit === null) {
        throw new Error("WalletKit not initialized");
      }

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
  }, [data.requestEvent, walletKit]);

  const handleConnect = useCallback(
    async (uri: string) => {
      if (!walletKit) {
        return;
      }

      const sessions = await walletKit.getActiveSessions();

      for (const session of Object.values(sessions)) {
        await walletKit.disconnectSession({
          topic: session.topic,
          reason: { code: 1000, message: "User disconnected" },
        });
      }

      await walletKit.pair({ uri });
    },
    [walletKit]
  );
  

  return (
    <WalletContext.Provider
      value={{
        data,
        setData,
        activeSessions,
        setActiveSessions,
        handleApproveProposal,
        handleApproveSignRequest,
        handleRejectProposal,
        handleRejectRequest,
        handleConnect,
        walletKit,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletConnect = (): WalletContextProps => {
  const context = useContext(WalletContext);
  if (!context)
    throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
