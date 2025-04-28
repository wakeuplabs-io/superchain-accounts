import envParsed from "@/envParsed";
import { Address, Chain, createPublicClient, http, PublicClient } from "viem";
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
  nativeCurrency: Chain["nativeCurrency"];
  rpcUrl: string;
  entryPointAddress: Address;
  client: PublicClient;
  bundler: BundlerClient;
  explorer: string;
}

export const clients: { [chainId: number]: PublicClient } = {
  [optimismSepolia.id]: createPublicClient({
    chain: optimismSepolia as Chain,
    transport: http(envParsed().RPC_OPTIMISM),
  }),
  [baseSepolia.id]: createPublicClient({
    chain: baseSepolia as Chain,
    transport: http(envParsed().RPC_BASE),
  }),
  [unichainSepolia.id]: createPublicClient({
    chain: unichainSepolia as Chain,
    transport: http(envParsed().RPC_UNICHAIN),
  }),
};

export const bundlers: { [chainId: number]: BundlerClient } = {
  [optimismSepolia.id]: createBundlerClient({
    chain: optimismSepolia,
    client: clients[optimismSepolia.id],
    transport: http(envParsed().BUNDLER_OPTIMISM),
    paymaster: true,
  }),
  [baseSepolia.id]: createBundlerClient({
    chain: baseSepolia,
    client: clients[baseSepolia.id],
    transport: http(envParsed().BUNDLER_BASE),
    paymaster: true,
  }),
  [unichainSepolia.id]: createBundlerClient({
    chain: unichainSepolia,
    client: clients[unichainSepolia.id],
    transport: http(envParsed().BUNDLER_UNICHAIN),
    paymaster: true,
  }),
};

export const supportedChains: Record<number, ChainMetadata> = {
  [optimismSepolia.id]: {
    order: 1,
    id: optimismSepolia.id,
    name: optimismSepolia.name,
    logo: optimismChainLogo,
    rpcUrl: envParsed().RPC_OPTIMISM,
    nativeCurrency: optimismSepolia.nativeCurrency,
    client: clients[optimismSepolia.id],
    bundler: bundlers[optimismSepolia.id],
    entryPointAddress: envParsed().ENTRYPOINT_OPTIMISM,
    explorer: envParsed().EXPLORER_OPTIMISM,
  },
  [baseSepolia.id]: {
    order: 2,
    id: baseSepolia.id,
    name: baseSepolia.name,
    logo: baseChainLogo,
    rpcUrl: envParsed().RPC_BASE,
    nativeCurrency: baseSepolia.nativeCurrency,
    client: clients[baseSepolia.id],
    bundler: bundlers[baseSepolia.id],
    entryPointAddress: envParsed().ENTRYPOINT_BASE,
    explorer: envParsed().EXPLORER_BASE,
  },
  [unichainSepolia.id]: {
    order: 3,
    id: unichainSepolia.id,
    name: unichainSepolia.name,
    logo: unichainChainLogo,
    rpcUrl: envParsed().RPC_UNICHAIN,
    nativeCurrency: unichainSepolia.nativeCurrency,
    client: clients[unichainSepolia.id],
    bundler: bundlers[unichainSepolia.id],
    entryPointAddress: envParsed().ENTRYPOINT_UNICHAIN,
    explorer: envParsed().EXPLORER_UNICHAIN,
  },
};

export const DEFAULT_CHAIN_ID = 11155420; // Optimism Sepolia
