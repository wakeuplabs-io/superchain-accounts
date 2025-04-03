import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { http } from "viem";
import { useWeb3 } from "./Web3Context";
import { useAuth } from "./AuthContext";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { SmartAccount } from "viem/account-abstraction";

type SuperChainAccountStatus = "pending" | "initialized" | "deployed";

type SuperChainAccount = {
    instance: SmartAccount | null;
    client: SmartAccountClient | null;
    status: "pending";
  } | {
    instance: SmartAccount;
    client: SmartAccountClient;
    status: Exclude<SuperChainAccountStatus, "pending">;
  };

type SuperChainAccountContextType = {
  account: SuperChainAccount;
}

const SuperChainAccountContext = createContext<SuperChainAccountContextType | undefined>(undefined);

export function SuperChainAccountProvider({ children }: { children: ReactNode }) {
  const {chain, getWeb3Data} = useWeb3();
  const {getProvider} = useAuth();
  
  const [account, setAccount] = useState<SuperChainAccount>({
    instance: null,
    client: null,
    status: "pending",
  });

  useEffect(() => {
    async function initialize() {
      console.log("Initializing smart account");
      const web3Data = getWeb3Data();
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
        chain: web3Data.pimlicoClient.chain,
        bundlerTransport: http(chain.pimlicoUrl),
        paymaster: web3Data.pimlicoClient,
        userOperation: {
          estimateFeesPerGas: async () => {
            return (await web3Data.pimlicoClient.getUserOperationGasPrice()).fast;
          },
        },
      });

      const isDeployed = await newSmartAccount.isDeployed();

      setAccount({
        instance: newSmartAccount,
        client: newSmartAccountClient,
        status: isDeployed ? "deployed" : "initialized",
      });
    }

    setAccount({
      instance: null,
      client: null,
      status: "pending",
    });
    
    initialize();
  },[chain, getWeb3Data, getProvider]);

  const value = {
    account,
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
