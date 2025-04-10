import { useContext } from "react";
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
import { SmartAccount } from "viem/account-abstraction";
import { transactionService } from "@/services";
import { useWeb3 } from "@/hooks/use-web3";
import { useAuth } from "@/hooks/use-auth";

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

export function useSuperChainAccount() {
  const context = useContext(SuperChainAccountContext);
  if (context === undefined) {
    throw new Error(
      "useSuperChainAccount must be used within a SuperchainAccountProvider"
    );
  }
  return context;
}

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
        return "0x0";
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
            ...preparedUserOperation,
            initCode: "",
            nonce: numberToHex(preparedUserOperation.nonce),
            callGasLimit: numberToHex(preparedUserOperation.callGasLimit),
            verificationGasLimit: numberToHex(
              preparedUserOperation.verificationGasLimit
            ),
            preVerificationGas: numberToHex(
              preparedUserOperation.preVerificationGas
            ),
            maxFeePerGas: numberToHex(preparedUserOperation.maxFeePerGas),
            maxPriorityFeePerGas: numberToHex(
              preparedUserOperation.maxPriorityFeePerGas
            ),
            paymasterVerificationGasLimit:
              preparedUserOperation.paymasterVerificationGasLimit &&
              numberToHex(preparedUserOperation.paymasterVerificationGasLimit),
            paymasterPostOpGasLimit:
              preparedUserOperation.paymasterPostOpGasLimit &&
              numberToHex(preparedUserOperation.paymasterPostOpGasLimit),
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
