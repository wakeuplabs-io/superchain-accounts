import envParsed from "@/envParsed";
import { createContext, useContext, ReactNode, useState, useRef, useEffect, useMemo } from "react";
import { Address, Chain, createPublicClient, http, PublicClient } from "viem";
import { baseSepolia, optimismSepolia, unichainSepolia } from "viem/chains";

import optimismChainLogo from "@/assets/logos/optimism-chain-logo.svg";
import baseChainLogo from "@/assets/logos/base-chain-logo.svg";
import unichainChainLogo from "@/assets/logos/unichain-chain-logo.svg";

const envVars = envParsed();

const DEFAULT_CHAIN_ID = 11155420; // Optimism Sepolia

export interface SmartAccountChain {
    data: Chain,
    rpcUrl: string;
    bundlerUrl: string;
    entryPointAddress: Address;
    logo: string;
    order: number;
}

export const supportedChains: Record<number, SmartAccountChain> = {
  [optimismSepolia.id]: {
    data: optimismSepolia,
    rpcUrl: envVars.RPC_OPTIMISM_SEPOLIA,
    bundlerUrl: envVars.BUNDLER_OPTIMISM_SEPOLIA,
    entryPointAddress: envVars.ENTRYPOINT_OPTIMISM_SEPOLIA,
    logo: optimismChainLogo,
    order: 1,
  },
  [baseSepolia.id]: {
    data: baseSepolia,
    rpcUrl: envVars.RPC_BASE_SEPOLIA,
    bundlerUrl: envVars.BUNDLER_BASE_SEPOLIA,
    entryPointAddress: envVars.ENTRYPOINT_BASE_SEPOLIA,
    logo: baseChainLogo,
    order: 2,
  },
  [unichainSepolia.id]: {
    data: unichainSepolia,
    rpcUrl: envVars.RPC_UNICHAIN_SEPOLIA,
    bundlerUrl: envVars.BUNDLER_UNICHAIN_SEPOLIA,
    entryPointAddress: envVars.ENTRYPOINT_UNICHAIN_SEPOLIA,
    logo: unichainChainLogo,
    order: 3,
  },
};

export type SupportedChainOptions = typeof supportedChains;

interface Web3ContextType {
  chain: SmartAccountChain;
  publicClient: PublicClient | null;
  updateChain: (chainId: number) => void;
}

export const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const publicClients = useRef(new Map<number, PublicClient>());
  const [chain, setChain] = useState<SmartAccountChain>(supportedChains[DEFAULT_CHAIN_ID]);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateChain = (chainId: number) => {
    const newChain = supportedChains[chainId];

    if (!newChain) {
      console.error(`Chain ID ${chainId} is not supported`);
      return;
    }
    
    if (!publicClients.current.has(chainId)) {
      const publicClient = createPublicClient({
        chain: newChain.data,
        transport: http(newChain.rpcUrl),
      });

      publicClients.current.set(chainId,publicClient);
    }

    setChain(newChain);
  };

  const publicClient = useMemo(() => {
    if (!publicClients.current.has(chain.data.id)) {
      return null;
    }

    return publicClients.current.get(chain.data.id)!;
  },[isInitialized, chain]);


  useEffect(() => {
    updateChain(DEFAULT_CHAIN_ID);
    setIsInitialized(true);
  },[]);

  return (
    <Web3Context.Provider value={{
      chain,
      updateChain,
      publicClient,
    }}>
      {children}
    </Web3Context.Provider>
  );
}
