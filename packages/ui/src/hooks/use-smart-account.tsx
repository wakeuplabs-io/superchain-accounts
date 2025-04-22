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
  SafeSmartAccountImplementation,
  toSafeSmartAccount,
} from "permissionless/accounts";
import { SmartAccount } from "viem/account-abstraction";
import { transactionService } from "@/services";
import { useWeb3 } from "@/hooks/use-web3";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { EthereumProvider } from "node_modules/permissionless/_types/utils/toOwner";
import { ChainMetadata } from "@/config/chains";

export interface SuperChainUserOperation {
  to: Address;
  value: bigint;
  data?: Hex;
}

type SuperChainAccountStatus = "pending" | "initialized" | "deployed";

type SuperChainAccount = {
  instance: SmartAccount<SafeSmartAccountImplementation<"0.7">> | null;
  status: SuperChainAccountStatus;
  address: Address;
};

type SuperChainAccountContextType = {
  account: SuperChainAccount;
  sendTransaction: (userOperation: SuperChainUserOperation, chainId?: number) => Promise<Hex>;
  signMessage: (message: string) => Promise<Hex>;
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
  const { chain, currentChainId, setCurrentChainId, getChain} = useWeb3();
  const { getProvider, updateProviderChain } = useAuth();
  const queryClient = useQueryClient();

  const [account, setAccount] = useState<SuperChainAccount>({
    instance: null,
    status: "pending",
    address: zeroAddress,
  });

  const signMessage = useCallback(
    async (message: string) => {
      if (!account.instance) {
        throw new Error("Account not initialized");
      }

      return await account.instance.signMessage({ message });
    },
    [account.instance]
  );

  const sendTransaction = async (userOperation: SuperChainUserOperation, chainId?: number): Promise<`0x${string}`> => {
    if (account.status === "pending" || !account.instance) {
      return "0x0";
    }

    try {
      let opChain: ChainMetadata | undefined = chain;
      let superChainAccount: SuperChainAccount = account;

      if(chainId && chainId !== chain.id) {
        opChain = getChain(chainId);

        if(!opChain) {
          throw new Error("Chain not supported");
        }

        superChainAccount = await initializeAccount(opChain);
        setCurrentChainId(opChain.id);
      } 

      if(!superChainAccount.instance) {
        throw new Error("Account not initialized");
      }

      await updateProviderChain(opChain);

      const { account: _, ...preparedUserOperation } =
          await opChain.bundler.prepareUserOperation({
            account: superChainAccount.instance,
            calls: [{ ...userOperation }],
          });

      const signature = await superChainAccount.instance.signUserOperation(
        preparedUserOperation
      );

      const txHash = await transactionService.sendUserOperation({
        chainId: String(opChain.id),
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

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["superchainPoints", superChainAccount.address, opChain.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["superchainBadges", superChainAccount.address, opChain.id],
        }),
      ]);

      return txHash;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  };

  const initializeAccount = async (chain: ChainMetadata): Promise<SuperChainAccount> => {
    const newSmartAccount = await toSafeSmartAccount({
      owners: [getProvider() as EthereumProvider],
      version: "1.4.1",
      client: chain.client,
      entryPoint: {
        address: chain.entryPointAddress,
        version: "0.7",
      },
    });

    const isDeployed = await newSmartAccount.isDeployed();

    const newAccount: SuperChainAccount = {
      instance: newSmartAccount,
      status: isDeployed ? "deployed" : "initialized",
      address: newSmartAccount.address,
    };

    setAccount(newAccount);

    return newAccount;
  };

  useEffect(() => {
    initializeAccount(chain).catch((error) => {
      console.error("Error initializing smart account:", error);
    });
  }, [currentChainId, chain, getProvider]);

  return (
    <SuperChainAccountContext.Provider
      value={{
        account,
        sendTransaction,
        signMessage,
      }}
    >
      {children}
    </SuperChainAccountContext.Provider>
  );
}
