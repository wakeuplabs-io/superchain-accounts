import envParsed from "@/envParsed";
import { createPimlicoClient, PimlicoClient } from "permissionless/clients/pimlico";
import { createContext, useContext, ReactNode, useState, useRef, useEffect } from "react";
import { Address, createPublicClient, http, PublicClient } from "viem";

const envVars = envParsed();

const DEFAULT_CHAIN_ID = 11155420; // Optimism Sepolia

interface SmartAccountChain {
    name: string;
    chainId: number;
    rpcUrl: string;
    pimlicoUrl: string;
    entryPointAddress: Address;
}

export const supportedChains: Record<number, SmartAccountChain> = {
  11155420: {
    name: "Optimism Sepolia",
    chainId: 11155420,
    rpcUrl: envVars.OPTIMISM_RPC_URL,
    pimlicoUrl: envVars.OPTIMISM_PIMLICO_URL,
    entryPointAddress: envVars.OPTIMISM_ENTRYPOINT_ADDRESS,
  },
  84532: {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: envVars.BASE_RPC_URL,
    pimlicoUrl: envVars.BASE_PIMLICO_URL,
    entryPointAddress: envVars.BASE_ENTRYPOINT_ADDRESS,
  },
  1301: {
    name: "Unichain Sepolia",
    chainId: 1301,
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
  chainId: number;
  updateChain: (chainId: number) => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const web3Data = useRef(new Map<number, Web3Data>());
  const [chainId, setChainId] = useState<number>(DEFAULT_CHAIN_ID);

  const updateChain = (chainId: number) => {
    if (!supportedChains[chainId]) {
      console.error(`Chain ID ${chainId} is not supported`);
      return;
    }
    
    if (!web3Data.current.has(chainId)) {
      const publicClient = createPublicClient({ 
        transport: http(supportedChains[chainId].rpcUrl),
      });

      const pimlicoClient = createPimlicoClient({
        transport: http(supportedChains[chainId].pimlicoUrl),
        entryPoint: {
          address: supportedChains[chainId].entryPointAddress,
          version: "0.7",
        }
      });

      web3Data.current.set(chainId, {
        publicClient,
        pimlicoClient,
      });
    }

    setChainId(chainId);
  };

  useEffect(() => {
    updateChain(chainId);
  },[]);

  return (
    <Web3Context.Provider value={{
      chainId,
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
