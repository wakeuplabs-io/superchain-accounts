import envParsed from "@/envParsed";
import { createPimlicoClient, PimlicoClient } from "permissionless/clients/pimlico";
import { createContext, useContext, ReactNode, useState, useRef, useEffect } from "react";
import { Address, createPublicClient, http, PublicClient } from "viem";

const envVars = envParsed();

const DEFAULT_CHAIN_ID = 11155420; // Optimism Sepolia

interface SmartAccountChain {
    name: string;
    id: number;
    rpcUrl: string;
    pimlicoUrl: string;
    entryPointAddress: Address;
}

export const supportedChains: Record<number, SmartAccountChain> = {
  11155420: {
    name: "Optimism Sepolia",
    id: 11155420,
    rpcUrl: envVars.OPTIMISM_RPC_URL,
    pimlicoUrl: envVars.OPTIMISM_PIMLICO_URL,
    entryPointAddress: envVars.OPTIMISM_ENTRYPOINT_ADDRESS,
  },
  84532: {
    name: "Base Sepolia",
    id: 84532,
    rpcUrl: envVars.BASE_RPC_URL,
    pimlicoUrl: envVars.BASE_PIMLICO_URL,
    entryPointAddress: envVars.BASE_ENTRYPOINT_ADDRESS,
  },
  1301: {
    name: "Unichain Sepolia",
    id: 1301,
    rpcUrl: envVars.UNICHAIN_RPC_URL,
    pimlicoUrl: envVars.UNICHAIN_PIMLICO_URL,
    entryPointAddress: envVars.UNICHAIN_ENTRYPOINT_ADDRESS,
  },
};

export type SupportedChainOptions = typeof supportedChains;

interface Web3Data {
    publicClient: PublicClient;
    pimlicoClient: PimlicoClient;
} 

interface Web3ContextType {
  chain: SmartAccountChain;
  updateChain: (chainId: number) => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const web3Data = useRef(new Map<number, Web3Data>());
  const [chain, setChain] = useState<SmartAccountChain>(supportedChains[DEFAULT_CHAIN_ID]);

  const updateChain = (chainId: number) => {
    const newChain = supportedChains[chainId];

    if (!newChain) {
      console.error(`Chain ID ${chainId} is not supported`);
      return;
    }
    
    if (!web3Data.current.has(chainId)) {
      const publicClient = createPublicClient({ 
        transport: http(newChain.rpcUrl),
      });

      const pimlicoClient = createPimlicoClient({
        transport: http(newChain.pimlicoUrl),
        entryPoint: {
          address: chain.entryPointAddress,
          version: "0.7",
        }
      });

      web3Data.current.set(chainId, {
        publicClient,
        pimlicoClient,
      });
    }

    setChain(newChain);
  };


  useEffect(() => {
    updateChain(DEFAULT_CHAIN_ID);
  },[]);

  return (
    <Web3Context.Provider value={{
      chain,
      updateChain,
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
