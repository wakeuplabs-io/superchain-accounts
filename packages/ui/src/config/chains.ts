import envParsed from "@/envParsed";
import { Address, createPublicClient, http, PublicClient } from "viem";
import { baseSepolia, optimismSepolia, unichainSepolia } from "viem/chains";
import { BundlerClient, createBundlerClient } from "viem/account-abstraction";

import optimismChainLogo from "@/assets/logos/optimism-chain-logo.svg";
import baseChainLogo from "@/assets/logos/base-chain-logo.svg";
import unichainChainLogo from "@/assets/logos/unichain-chain-logo.svg";

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
    logo: optimismChainLogo,
    client: createPublicClient({
      transport: http(envParsed().RPC_OPTIMISM_SEPOLIA),
    }),
    bundler: createBundlerClient({
      client: createPublicClient({
        transport: http(envParsed().RPC_OPTIMISM_SEPOLIA),
      }),
      transport: http(envParsed().BUNDLER_OPTIMISM_SEPOLIA),
      paymaster: true,
    }),
    entryPointAddress: envParsed().ENTRYPOINT_OPTIMISM_SEPOLIA,
  },
  [baseSepolia.id]: {
    order: 2,
    id: baseSepolia.id,
    name: baseSepolia.name,
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
    entryPointAddress: envParsed().ENTRYPOINT_BASE_SEPOLIA,
  },
  [unichainSepolia.id]: {
    order: 3,
    id: unichainSepolia.id,
    name: unichainSepolia.name,
    logo: unichainChainLogo,
    client: createPublicClient({
      transport: http(envParsed().RPC_UNICHAIN_SEPOLIA),
    }),
    bundler: createBundlerClient({
      client: createPublicClient({
        transport: http(envParsed().RPC_UNICHAIN_SEPOLIA),
      }),
      transport: http(envParsed().BUNDLER_UNICHAIN_SEPOLIA),
      paymaster: true,
    }),
    entryPointAddress: envParsed().ENTRYPOINT_UNICHAIN_SEPOLIA,
  },
};

export const DEFAULT_CHAIN_ID = 11155420; // Optimism Sepolia
