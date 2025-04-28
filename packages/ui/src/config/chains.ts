import envParsed from "@/envParsed";
import { Address, Chain, createPublicClient, http, PublicClient } from "viem";
import {
  baseSepolia,
  optimismSepolia,
  unichainSepolia,
  base,
  optimism,
  unichain,
} from "viem/chains";
import { BundlerClient, createBundlerClient } from "viem/account-abstraction";

import optimismChainLogo from "@/assets/logos/optimism-chain-logo.svg";
import baseChainLogo from "@/assets/logos/base-chain-logo.svg";
import unichainChainLogo from "@/assets/logos/unichain-chain-logo.svg";

export const CHAINS = import.meta.env.DEV
  ? {
      optimism: optimismSepolia,
      base: baseSepolia,
      unichain: unichainSepolia,
    }
  : {
      optimism: optimism,
      base: base,
      unichain: unichain,
    };

export interface ChainMetadata {
  id: number;
  name: string;
  order: number;
  logo: string;
  nativeCurrency: Chain["nativeCurrency"];
  rpcUrl: string;
  publicRpcUrl: string;
  entryPointAddress: Address;
  client: PublicClient;
  bundler: BundlerClient;
  explorer: string;
}

export const clients: { [chainId: number]: PublicClient } = {
  [CHAINS.optimism.id]: createPublicClient({
    chain: CHAINS.optimism as Chain,
    transport: http(envParsed().RPC_OPTIMISM),
  }),
  [CHAINS.base.id]: createPublicClient({
    chain: CHAINS.base as Chain,
    transport: http(envParsed().RPC_BASE),
  }),
  [CHAINS.unichain.id]: createPublicClient({
    chain: CHAINS.unichain as Chain,
    transport: http(envParsed().RPC_UNICHAIN),
  }),
};

export const bundlers: { [chainId: number]: BundlerClient } = {
  [CHAINS.optimism.id]: createBundlerClient({
    chain: CHAINS.optimism,
    client: clients[CHAINS.optimism.id],
    transport: http(envParsed().BUNDLER_OPTIMISM),
    paymaster: true,
  }),
  [CHAINS.base.id]: createBundlerClient({
    chain: CHAINS.base,
    client: clients[CHAINS.base.id],
    transport: http(envParsed().BUNDLER_BASE),
    paymaster: true,
  }),
  [CHAINS.unichain.id]: createBundlerClient({
    chain: CHAINS.unichain,
    client: clients[CHAINS.unichain.id],
    transport: http(envParsed().BUNDLER_UNICHAIN),
    paymaster: true,
  }),
};

export const supportedChains: Record<number, ChainMetadata> = {
  [CHAINS.optimism.id]: {
    order: 1,
    id: CHAINS.optimism.id,
    name: CHAINS.optimism.name,
    logo: optimismChainLogo,
    rpcUrl: envParsed().RPC_OPTIMISM,
    publicRpcUrl: CHAINS.optimism.rpcUrls.default.http[0],
    nativeCurrency: CHAINS.optimism.nativeCurrency,
    client: clients[CHAINS.optimism.id],
    bundler: bundlers[CHAINS.optimism.id],
    entryPointAddress: envParsed().ENTRYPOINT_OPTIMISM,
    explorer: envParsed().EXPLORER_OPTIMISM,
  },
  [CHAINS.base.id]: {
    order: 2,
    id: CHAINS.base.id,
    name: CHAINS.base.name,
    logo: baseChainLogo,
    rpcUrl: envParsed().RPC_BASE,
    publicRpcUrl: CHAINS.base.rpcUrls.default.http[0],
    nativeCurrency: CHAINS.base.nativeCurrency,
    client: clients[CHAINS.base.id],
    bundler: bundlers[CHAINS.base.id],
    entryPointAddress: envParsed().ENTRYPOINT_BASE,
    explorer: envParsed().EXPLORER_BASE,
  },
  [CHAINS.unichain.id]: {
    order: 3,
    id: CHAINS.unichain.id,
    name: CHAINS.unichain.name,
    logo: unichainChainLogo,
    rpcUrl: envParsed().RPC_UNICHAIN,
    publicRpcUrl: CHAINS.unichain.rpcUrls.default.http[0],
    nativeCurrency: CHAINS.unichain.nativeCurrency,
    client: clients[CHAINS.unichain.id],
    bundler: bundlers[CHAINS.unichain.id],
    entryPointAddress: envParsed().ENTRYPOINT_UNICHAIN,
    explorer: envParsed().EXPLORER_UNICHAIN,
  },
};

export const DEFAULT_CHAIN_ID = CHAINS.optimism.id as number;
