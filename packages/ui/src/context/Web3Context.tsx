import envParsed from "@/envParsed";
import { createContext, useContext, ReactNode, useState, useRef, useEffect, useMemo } from "react";
import { Address, Chain, createPublicClient, http, PublicClient } from "viem";
import { baseSepolia, optimismSepolia, unichainSepolia } from "viem/chains";

const envVars = envParsed();

const DEFAULT_CHAIN_ID = 11155420; // Optimism Sepolia

interface SmartAccountChain {
    data: Chain,
    rpcUrl: string;
    pimlicoUrl: string;
    entryPointAddress: Address;
    order: number;
}

export const supportedChains: Record<number, SmartAccountChain> = {
  [optimismSepolia.id]: {
    data: optimismSepolia,
    rpcUrl: envVars.OPTIMISM_RPC_URL,
    pimlicoUrl: envVars.OPTIMISM_PIMLICO_URL,
    entryPointAddress: envVars.OPTIMISM_ENTRYPOINT_ADDRESS,
    order: 1,
  },
  [baseSepolia.id]: {
    data: baseSepolia,
    rpcUrl: envVars.BASE_RPC_URL,
    pimlicoUrl: envVars.BASE_PIMLICO_URL,
    entryPointAddress: envVars.BASE_ENTRYPOINT_ADDRESS,
    order: 2,
  },
  [unichainSepolia.id]: {
    data: unichainSepolia,
    rpcUrl: envVars.UNICHAIN_RPC_URL,
    pimlicoUrl: envVars.UNICHAIN_PIMLICO_URL,
    entryPointAddress: envVars.UNICHAIN_ENTRYPOINT_ADDRESS,
    order: 3,
  },
};

export type SupportedChainOptions = typeof supportedChains;
interface Web3ContextType {
  chain: SmartAccountChain;
  publicClient: PublicClient | null;
  updateChain: (chainId: number) => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const chainPublicClients = useRef(new Map<number, PublicClient>());
  const [chain, setChain] = useState<SmartAccountChain>(supportedChains[DEFAULT_CHAIN_ID]);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateChain = (chainId: number) => {
    const newChain = supportedChains[chainId];

    if (!newChain) {
      console.error(`Chain ID ${chainId} is not supported`);
      return;
    }
    
    if (!chainPublicClients.current.has(chainId)) {
      const publicClient = createPublicClient({
        chain: newChain.data,
        transport: http(newChain.rpcUrl),
      });

      chainPublicClients.current.set(chainId,publicClient);
    }

    setChain(newChain);
  };

  const chainPublicClient = useMemo(() => {
    if (!chainPublicClients.current.has(chain.data.id)) {
      return null;
    }

    return chainPublicClients.current.get(chain.data.id)!;
  },[isInitialized, chain]);


  useEffect(() => {
    updateChain(DEFAULT_CHAIN_ID);
    setIsInitialized(true);
  },[]);

  return (
    <Web3Context.Provider value={{
      chain,
      updateChain,
      publicClient: chainPublicClient,
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
