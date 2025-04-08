import { BundlerClient, createBundlerClient } from "viem/account-abstraction";
import { ProviderFactory } from "./provider-factory";
import { http } from "viem";
import envParsed from "@/envParsed";

const TRANSPORTS_URLS: {
  [key: number]: string;
} = {
  1301: envParsed().BUNDLER_UNICHAIN_SEPOLIA,
  84532: envParsed().BUNDLER_BASE_SEPOLIA,
  11155420: envParsed().BUNDLER_OPTIMISM_SEPOLIA
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
      transport: http(TRANSPORTS_URLS[chainId]),
    });

    return this.clients[chainId] as BundlerClient;
  }
}
