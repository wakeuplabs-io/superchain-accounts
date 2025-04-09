import envParsed from "@/envParsed";
import { createContext, ReactNode, useState, useMemo } from "react";
import { Address, createPublicClient, http, PublicClient } from "viem";
import { baseSepolia, optimismSepolia, unichainSepolia } from "viem/chains";

import optimismChainLogo from "@/assets/logos/optimism-chain-logo.svg";
import baseChainLogo from "@/assets/logos/base-chain-logo.svg";
import unichainChainLogo from "@/assets/logos/unichain-chain-logo.svg";
import { BundlerClient, createBundlerClient } from "viem/account-abstraction";

const DEFAULT_CHAIN_ID = 11155420; // Optimism Sepolia

export interface ChainMetadata {
  id: number;
  name: string;
  order: number;
  logo: string;
  entryPointAddress: Address;
  client: PublicClient;
  bundler: BundlerClient;
}

export const supportedChains: Record<number, ChainMetadata> = {
  [optimismSepolia.id]: {
    order: 1,
    id: optimismSepolia.id,
    name: optimismSepolia.name,
    entryPointAddress: envParsed().ENTRYPOINT_OPTIMISM_SEPOLIA,
    logo: optimismChainLogo,
    client: createPublicClient({
      // chain: optimismSepolia,
      transport: http(envParsed().RPC_OPTIMISM_SEPOLIA),
    }),
    bundler: createBundlerClient({
      client: createPublicClient({
        // chain: optimismSepolia,
        transport: http(envParsed().RPC_OPTIMISM_SEPOLIA),
      }),
      transport: http(envParsed().BUNDLER_OPTIMISM_SEPOLIA),
      paymaster: true,
    }),
  },
  [baseSepolia.id]: {
    order: 2,
    id: baseSepolia.id,
    name: baseSepolia.name,

    entryPointAddress: envParsed().ENTRYPOINT_BASE_SEPOLIA,
    logo: baseChainLogo,
    client: createPublicClient({
      transport: http(envParsed().RPC_BASE_SEPOLIA),
    }),
    bundler: createBundlerClient({
      client: createPublicClient({
        transport: http(envParsed().RPC_BASE_SEPOLIA),
      }),
      transport: http(envParsed().BUNDLER_BASE_SEPOLIA),
      paymaster: true,
    }),
  },
  [unichainSepolia.id]: {
    order: 3,
    id: unichainSepolia.id,
    name: unichainSepolia.name,
    logo: unichainChainLogo,
    entryPointAddress: envParsed().ENTRYPOINT_UNICHAIN_SEPOLIA,
    client: createPublicClient({
      // chain: unichainSepolia,
      transport: http(envParsed().RPC_UNICHAIN_SEPOLIA),
    }),
    bundler: createBundlerClient({
      client: createPublicClient({
        transport: http(envParsed().RPC_UNICHAIN_SEPOLIA),
      }),
      transport: http(envParsed().BUNDLER_UNICHAIN_SEPOLIA),
      paymaster: true,
    }),
  },
};

export type SupportedChainOptions = typeof supportedChains;

interface Web3ContextType {
  chain: ChainMetadata;
  currentChainId: number;
  setCurrentChainId: (chainId: number) => void;
}

export const Web3Context = createContext<Web3ContextType | undefined>(
  undefined
);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [currentChainId, setCurrentChainId] = useState(DEFAULT_CHAIN_ID);

  const chain = useMemo(() => {
    return supportedChains[currentChainId];
  }, [currentChainId]);

  return (
    <Web3Context.Provider
      value={{
        chain,
        currentChainId,
        setCurrentChainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
