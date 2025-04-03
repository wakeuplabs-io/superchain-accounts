import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { http } from "viem";
import { useWeb3 } from "./Web3Context";
import { useAuth } from "./AuthContext";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { SmartAccount, UserOperationCall } from "viem/account-abstraction";

type SuperChainAccountStatus = "pending" | "initialized" | "deployed";

type SuperChainAccount = {
    instance: SmartAccount | null;
    client: SmartAccountClient | null;
    balance: 0n;
    status: "pending";
  } | {
    instance: SmartAccount;
    client: SmartAccountClient;
    balance: bigint;
    status: Exclude<SuperChainAccountStatus, "pending">;
  };

type SuperChainAccountContextType = {
  account: SuperChainAccount;
  deploySmartAccount: () => Promise<void>;
}

const SuperChainAccountContext = createContext<SuperChainAccountContextType | undefined>(undefined);

export function SuperChainAccountProvider({ children }: { children: ReactNode }) {
  const {chain, web3Data} = useWeb3();
  const {getProvider} = useAuth();
  
  const [account, setAccount] = useState<SuperChainAccount>({
    instance: null,
    client: null,
    balance: 0n,
    status: "pending",
  });

  const sendTransaction = useCallback(async (transaction: UserOperationCall) => {
    if(account.status === "pending" || !web3Data) {
      return;
    }

    try {
      const receipt = await account.client.sendTransaction({
        account: account.instance,
        chain: chain.data,
        ...transaction
      });

      return receipt;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }, [account, web3Data]);

  const deploySmartAccount = async () => {
    if(account.status !== "initialized" || !web3Data) {
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
      const balance = await web3Data.publicClient.getBalance({
        address: account.instance.address,
      });
      newBalance = balance;
    } catch (error) {
      newStatus = "initialized";
    }

    setAccount(prev => ({
      instance: prev.instance!,
      client: prev.client!,
      balance: newBalance,
      status: newStatus,
    }));
  };


  useEffect(() => {
    async function initialize() {
      if(!web3Data) {
        return;
      }

      const provider = getProvider();
      const newSmartAccount = await toSimpleSmartAccount({
        owner: provider,
        client: web3Data.publicClient,
        entryPoint: {
          address: chain.entryPointAddress,
          version: "0.7",
        }
      });

      if(!newSmartAccount) {
        console.error("Failed to create smart account");
        return;
      }

      const newSmartAccountClient = createSmartAccountClient({
        account: newSmartAccount,
        chain: chain.data,
        bundlerTransport: http(chain.pimlicoUrl),
        paymaster: web3Data.pimlicoClient,
        userOperation: {
          estimateFeesPerGas: async () => {
            return (await web3Data.pimlicoClient.getUserOperationGasPrice()).fast;
          },
        },
      });

      const isDeployed = await newSmartAccount.isDeployed();

      const balance = await web3Data.publicClient.getBalance({
        address: newSmartAccount.address,
      });

      setAccount({
        balance,
        instance: newSmartAccount,
        client: newSmartAccountClient,
        status: isDeployed ? "deployed" : "initialized",
      });
    }

    setAccount({
      instance: null,
      client: null,
      balance: 0n,
      status: "pending",
    });
    
    initialize();
  },[chain, web3Data, getProvider]);

  const value = {
    account,
    deploySmartAccount,
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
