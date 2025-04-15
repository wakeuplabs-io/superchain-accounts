import envParsed from "@/envParsed";
import { Address, Chain, createPublicClient, http, PublicClient, zeroAddress } from "viem";
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
  nativeCurrency: Chain["nativeCurrency"],
  client: PublicClient;
  bundler: BundlerClient;
  explorer: string;
  entryPointAddress: Address;
  uniswapQuoterAddress: Address;
  uniswapRouterAddress: Address;
  uniswapFactoryAddress: Address;
}

export const clients: { [chainId: number]: PublicClient } = {
  [optimismSepolia.id]: createPublicClient({
    chain: optimismSepolia as Chain,
    transport: http(envParsed().RPC_OPTIMISM_SEPOLIA),
  }),
  [baseSepolia.id]: createPublicClient({
    chain: baseSepolia as Chain,
    transport: http(envParsed().RPC_BASE_SEPOLIA),
  }),
  [unichainSepolia.id]: createPublicClient({
    chain: unichainSepolia as Chain,
    transport: http(envParsed().RPC_UNICHAIN_SEPOLIA),
  }),
};

export const bundlers: { [chainId: number]: BundlerClient } = {
  [optimismSepolia.id]: createBundlerClient({
    chain: optimismSepolia,
    client: clients[optimismSepolia.id],
    transport: http(envParsed().BUNDLER_OPTIMISM_SEPOLIA),
    paymaster: true,
  }),
  [baseSepolia.id]: createBundlerClient({
    chain: baseSepolia,
    client: clients[baseSepolia.id],
    transport: http(envParsed().BUNDLER_BASE_SEPOLIA),
    paymaster: true,
  }),
  [unichainSepolia.id]: createBundlerClient({
    chain: unichainSepolia,
    client: clients[unichainSepolia.id],
    transport: http(envParsed().BUNDLER_UNICHAIN_SEPOLIA),
    paymaster: true,
  }),
};

export const supportedChains: Record<number, ChainMetadata> = {
  [optimismSepolia.id]: {
    order: 1,
    id: optimismSepolia.id,
    name: optimismSepolia.name,
    logo: optimismChainLogo,
    nativeCurrency: optimismSepolia.nativeCurrency,
    client: clients[optimismSepolia.id],
    bundler: bundlers[optimismSepolia.id],
    entryPointAddress: envParsed().ENTRYPOINT_OPTIMISM_SEPOLIA,
    explorer: envParsed().EXPLORER_OPTIMISM_SEPOLIA,
    uniswapQuoterAddress: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27",
    uniswapRouterAddress: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
    uniswapFactoryAddress: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24"
  },
  [baseSepolia.id]: {
    order: 2,
    id: baseSepolia.id,
    name: baseSepolia.name,
    nativeCurrency: baseSepolia.nativeCurrency,
    logo: baseChainLogo,
    client: clients[baseSepolia.id],
    bundler: bundlers[baseSepolia.id],
    entryPointAddress: envParsed().ENTRYPOINT_BASE_SEPOLIA,
    explorer: envParsed().EXPLORER_BASE_SEPOLIA,
    uniswapQuoterAddress: zeroAddress,
    uniswapRouterAddress:zeroAddress,
    uniswapFactoryAddress: zeroAddress
  },
  [unichainSepolia.id]: {
    order: 3,
    id: unichainSepolia.id,
    name: unichainSepolia.name,
    nativeCurrency: unichainSepolia.nativeCurrency,
    logo: unichainChainLogo,
    client: clients[unichainSepolia.id],
    bundler: bundlers[unichainSepolia.id],
    entryPointAddress: envParsed().ENTRYPOINT_UNICHAIN_SEPOLIA,
    explorer: envParsed().EXPLORER_UNICHAIN_SEPOLIA,
    uniswapQuoterAddress: zeroAddress,
    uniswapRouterAddress:zeroAddress,
    uniswapFactoryAddress: zeroAddress
  },
};

export const DEFAULT_CHAIN_ID = 11155420; // Optimism Sepolia
