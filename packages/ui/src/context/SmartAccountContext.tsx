import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { Address, Hex, http, numberToHex } from "viem";
import { useWeb3 } from "./Web3Context";
import { useAuth } from "./AuthContext";
import { SimpleSmartAccountImplementation, toSimpleSmartAccount, ToSimpleSmartAccountParameters } from "permissionless/accounts";
import { BundlerClient, createBundlerClient, SmartAccount, UserOperation,  } from "viem/account-abstraction";
import { transactionService } from "@/services";

function formatUserOperation(userOperation: UserOperation) {
  return ({
    ...userOperation,
    initCode: "",
    nonce: numberToHex(userOperation.nonce),
    callGasLimit: numberToHex(userOperation.callGasLimit),
    verificationGasLimit: numberToHex(userOperation.verificationGasLimit),
    preVerificationGas: numberToHex(userOperation.preVerificationGas),
    maxFeePerGas: numberToHex(userOperation.maxFeePerGas),
    maxPriorityFeePerGas: numberToHex(userOperation.maxPriorityFeePerGas),
    paymasterVerificationGasLimit: userOperation.paymasterVerificationGasLimit && numberToHex(userOperation.paymasterVerificationGasLimit),
    paymasterPostOpGasLimit: userOperation.paymasterPostOpGasLimit && numberToHex(userOperation.paymasterPostOpGasLimit),
  });
}

interface SuperChainUserOperation  {
    to: Address;
    value: bigint;
    data?: Hex;
}

type SuperChainAccountStatus = "pending" | "initialized" | "deployed";

type SuperChainAccount = {
    instance: SmartAccount<SimpleSmartAccountImplementation<"0.7">> | null;
    bundlerClient: BundlerClient | null; //TODO: remove this when we have a better solutio
    balance: 0n;
    status: "pending";
  } | {
    instance: SmartAccount<SimpleSmartAccountImplementation<"0.7">>;
    bundlerClient: BundlerClient;
    balance: bigint;
    status: Exclude<SuperChainAccountStatus, "pending">;
  };

type SuperChainAccountContextType = {
  account: SuperChainAccount;
  deploySmartAccount: () => Promise<void>;
  sendTransaction: (userOperation: SuperChainUserOperation) => Promise<void>;
}

const SuperChainAccountContext = createContext<SuperChainAccountContextType | undefined>(undefined);

export function SuperChainAccountProvider({ children }: { children: ReactNode }) {
  const {chain, publicClient} = useWeb3();
  const {getProvider} = useAuth();
  
  const [account, setAccount] = useState<SuperChainAccount>({
    instance: null,
    bundlerClient: null,
    balance: 0n,
    status: "pending",
  });

  const sendTransaction = useCallback(async (userOperation: SuperChainUserOperation) => {
    if(account.status === "pending" || !publicClient) {
      return;
    }

    try {
      const {account: _, ...preparedUserOperation} = await account.bundlerClient.prepareUserOperation({
        account: account.instance,
        calls: [{
          ...userOperation,
        }],
      });

      const signature = await account.instance.signUserOperation(preparedUserOperation);
     
      await transactionService.sendUserOperation({
        chainId: chain.data.id,
        operation: {
          ...formatUserOperation(preparedUserOperation),
          signature,
        },
      });

    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }, [account, publicClient]);

  const deploySmartAccount = async () => {
    if(account.status !== "initialized" || !publicClient) {
      return;
    }

    // Send a user operation to the bundler to deploy the smart account
    const transaction = {
      to: account.instance.address,
      value: BigInt(0),
    };

    let newStatus: SuperChainAccountStatus = "deployed"; 
    let newBalance = account.balance;
    
    try {
      await sendTransaction(transaction);
      const balance = await publicClient.getBalance({
        address: account.instance.address,
      });
      newBalance = balance;
    } catch (error) {
      newStatus = "initialized";
    }

    setAccount(prev => ({
      instance: prev.instance!,
      bundlerClient: prev.bundlerClient!,
      balance: newBalance,
      status: newStatus,
    }));
  };

  useEffect(() => {
    async function initialize() {
      if(!publicClient) {
        return;
      }

      const newSmartAccount = await toSimpleSmartAccount({
        owner: getProvider() as ToSimpleSmartAccountParameters<"0.7">["owner"],
        client: publicClient,
        entryPoint: {
          address: chain.entryPointAddress,
          version: "0.7",
        }
      });

      if(!newSmartAccount) {
        console.error("Failed to create smart account");
        return;
      }

      const bundlerClient = createBundlerClient({
        client: publicClient,
        transport: http(chain.pimlicoUrl),
        paymaster: true,
      });

      const isDeployed = await newSmartAccount.isDeployed();

      const balance = await publicClient.getBalance({
        address: newSmartAccount.address,
      });

      setAccount({
        balance,
        instance: newSmartAccount,
        bundlerClient,
        status: isDeployed ? "deployed" : "initialized",
      });
    }

    setAccount({
      instance: null,
      bundlerClient: null,
      balance: 0n,
      status: "pending",
    });
    
    initialize();
  },[chain, publicClient, getProvider]);

  const value = {
    account,
    deploySmartAccount,
    sendTransaction,
  };

  return (
    <SuperChainAccountContext.Provider value={value}>
      {children}
    </SuperChainAccountContext.Provider>
  );
}

export function useSuperChainAccount() {
  const context = useContext(SuperChainAccountContext);
  if (context === undefined) {
    throw new Error("useSuperChainAccount must be used within a SuperchainAccountProvider");
  }
  return context;
}
