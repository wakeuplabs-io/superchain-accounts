import { BundlerClient, createBundlerClient } from "viem/account-abstraction";
import { ProviderFactory } from "./provider-factory.js";
import { http } from "viem";
import envParsed from "@/envParsed.js";

type ChainData = {
  bundlerUrl: string;
  entryPoint: string;
};

export const CHAIN_DATA: {
  [key: number]: ChainData;
} = {
  1301: {
    bundlerUrl: envParsed().BUNDLER_UNICHAIN_SEPOLIA,
    entryPoint: envParsed().ENTRYPOINT_UNICHAIN_SEPOLIA,
  },
  84532: {
    bundlerUrl: envParsed().BUNDLER_BASE_SEPOLIA,
    entryPoint: envParsed().ENTRYPOINT_BASE_SEPOLIA,
  },
  11155420: {
    bundlerUrl: envParsed().BUNDLER_OPTIMISM_SEPOLIA,
    entryPoint: envParsed().ENTRYPOINT_OPTIMISM_SEPOLIA,
  },
};

export class BundlerFactory {
  static clients: {
    [key: number]: BundlerClient | undefined;
  } = {};

  static getBundler(chainId: number): BundlerClient {
    if (this.clients[chainId]) {
      return this.clients[chainId] as BundlerClient;
    }

    this.clients[chainId] = createBundlerClient({
      client: ProviderFactory.getProvider(chainId),
      transport: http(CHAIN_DATA[chainId].bundlerUrl),
    });

    return this.clients[chainId] as BundlerClient;
  }
}
