import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Address, Hex, numberToHex, zeroAddress } from "viem";
import {
  SimpleSmartAccountImplementation,
  toSimpleSmartAccount,
  ToSimpleSmartAccountParameters,
} from "permissionless/accounts";
import { SmartAccount, UserOperation } from "viem/account-abstraction";
import { transactionService } from "@/services";
import { useWeb3 } from "@/hooks/use-web3";
import { useAuth } from "@/hooks/use-auth";

function formatUserOperation(userOperation: UserOperation) {
  return {
    ...userOperation,
    initCode: "",
    nonce: numberToHex(userOperation.nonce),
    callGasLimit: numberToHex(userOperation.callGasLimit),
    verificationGasLimit: numberToHex(userOperation.verificationGasLimit),
    preVerificationGas: numberToHex(userOperation.preVerificationGas),
    maxFeePerGas: numberToHex(userOperation.maxFeePerGas),
    maxPriorityFeePerGas: numberToHex(userOperation.maxPriorityFeePerGas),
    paymasterVerificationGasLimit:
      userOperation.paymasterVerificationGasLimit &&
      numberToHex(userOperation.paymasterVerificationGasLimit),
    paymasterPostOpGasLimit:
      userOperation.paymasterPostOpGasLimit &&
      numberToHex(userOperation.paymasterPostOpGasLimit),
  };
}

interface SuperChainUserOperation {
  to: Address;
  value: bigint;
  data?: Hex;
}

type SuperChainAccountStatus = "pending" | "initialized" | "deployed";

type SuperChainAccount = {
  instance: SmartAccount<SimpleSmartAccountImplementation<"0.7">> | null;
  balance: bigint;
  status: SuperChainAccountStatus;
  address: Address;
};

type SuperChainAccountContextType = {
  account: SuperChainAccount;
  sendTransaction: (
    userOperation: SuperChainUserOperation
  ) => Promise<`0x${string}`>;
};

export const SuperChainAccountContext = createContext<
  SuperChainAccountContextType | undefined
>(undefined);

export function SuperChainAccountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { chain, currentChainId } = useWeb3();
  const { getProvider } = useAuth();

  const [account, setAccount] = useState<SuperChainAccount>({
    instance: null,
    balance: 0n,
    status: "pending",
    address: zeroAddress,
  });

  const sendTransaction = useCallback(
    async (userOperation: SuperChainUserOperation): Promise<`0x${string}`> => {
      if (account.status === "pending" || !account.instance) {
        return;
      }

      try {
        const { account: _, ...preparedUserOperation } =
          await chain.bundler.prepareUserOperation({
            account: account.instance,
            calls: [{ ...userOperation }],
          });

        const signature = await account.instance.signUserOperation(
          preparedUserOperation
        );

        const txHash = await transactionService.sendUserOperation({
          chainId: String(chain.id),
          operation: {
            ...formatUserOperation(preparedUserOperation),
            signature,
          },
        });

        return txHash;
      } catch (error) {
        console.error("Error sending transaction:", error);
        throw error;
      }
    },
    [account, chain]
  );

  useEffect(() => {
    async function initialize() {
      const newSmartAccount = await toSimpleSmartAccount({
        owner: getProvider() as ToSimpleSmartAccountParameters<"0.7">["owner"],
        client: chain.client,
        entryPoint: {
          address: chain.entryPointAddress,
          version: "0.7",
        },
      });

      const isDeployed = await newSmartAccount.isDeployed();

      const balance = await chain.client.getBalance({
        address: newSmartAccount.address,
      });

      setAccount({
        balance,
        instance: newSmartAccount,
        status: isDeployed ? "deployed" : "initialized",
        address: newSmartAccount.address,
      });
    }

    initialize().catch((error) => {
      console.error("Error initializing smart account:", error);
    });
  }, [currentChainId, chain, getProvider]);

  return (
    <SuperChainAccountContext.Provider
      value={{
        account,
        sendTransaction,
      }}
    >
      {children}
    </SuperChainAccountContext.Provider>
  );
}
