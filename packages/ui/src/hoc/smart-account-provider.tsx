import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Address, Hex, http, numberToHex, zeroAddress } from "viem";
import {
  SimpleSmartAccountImplementation,
  toSimpleSmartAccount,
  ToSimpleSmartAccountParameters,
} from "permissionless/accounts";
import {
  BundlerClient,
  createBundlerClient,
  SmartAccount,
  UserOperation,
} from "viem/account-abstraction";
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
  sendTransaction: (userOperation: SuperChainUserOperation) => Promise<void>;
};

export const SuperChainAccountContext = createContext<
  SuperChainAccountContextType | undefined
>(undefined);

export function SuperChainAccountProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { getProvider } = useAuth();
  const { chain, publicClient } = useWeb3();
  const [bundlerClient, setBundlerClient] = useState<BundlerClient | null>(
    null
  );

  const [account, setAccount] = useState<SuperChainAccount>({
    instance: null,
    balance: 0n,
    status: "pending",
    address: zeroAddress,
  });

  const sendTransaction = useCallback(
    async (userOperation: SuperChainUserOperation) => {
      if (account.status === "pending" || !publicClient || !bundlerClient || !account.instance) {
        return;
      }

      try {
        const { account: _, ...preparedUserOperation } =
          await bundlerClient.prepareUserOperation({
            account: account.instance,
            calls: [
              {
                ...userOperation,
              },
            ],
          });

        const signature = await account.instance.signUserOperation(
          preparedUserOperation
        );

        await transactionService.sendUserOperation({
          chainId: String(chain.data.id),
          operation: {
            ...formatUserOperation(preparedUserOperation),
            signature,
          },
        });
      } catch (error) {
        console.error("Error sending transaction:", error);
        throw error;
      }
    },
    [account, publicClient]
  );

  useEffect(() => {
    async function initialize() {
      if (!publicClient) {
        return;
      }

      const newSmartAccount = await toSimpleSmartAccount({
        owner: getProvider() as ToSimpleSmartAccountParameters<"0.7">["owner"],
        client: publicClient,
        entryPoint: {
          address: chain.entryPointAddress,
          version: "0.7",
        },
      });

      if (!newSmartAccount) {
        console.error("Failed to create smart account");
        return;
      }

      const bundlerClient = createBundlerClient({
        client: publicClient,
        transport: http(chain.bundlerUrl),
        paymaster: true,
      });

      const isDeployed = await newSmartAccount.isDeployed();

      const balance = await publicClient.getBalance({
        address: newSmartAccount.address,
      });

      setBundlerClient(bundlerClient);

      setAccount({
        balance,
        instance: newSmartAccount,
        status: isDeployed ? "deployed" : "initialized",
        address: newSmartAccount.address,
      });
    }

    setAccount({
      instance: null,
      balance: 0n,
      status: "pending",
      address: zeroAddress,
    });

    initialize();
  }, [chain, publicClient, getProvider]);

  const value = {
    account,
    sendTransaction,
  };

  return (
    <SuperChainAccountContext.Provider value={value}>
      {children}
    </SuperChainAccountContext.Provider>
  );
}
