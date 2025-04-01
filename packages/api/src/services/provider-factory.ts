import envParsed from "@/envParsed.js";
import { createPublicClient, http, PublicClient } from "viem";

const TRANSPORTS_URLS: {
  [key: number]: string;
} = {
  1301: envParsed().RPC_UNICHAIN_SEPOLIA,
  84532: envParsed().RPC_BASE_SEPOLIA,
  11155420: envParsed().RPC_OPTIMISM_SEPOLIA,
};

export class ProviderFactory {
  static clients: {
    [key: number]: PublicClient | undefined;
  } = {};

  static getProvider(chainId: number): PublicClient {
    if (this.clients[chainId]) {
      return this.clients[chainId];
    }

    this.clients[chainId] = createPublicClient({
      transport: http(TRANSPORTS_URLS[chainId]),
    });

    return this.clients[chainId];
  }
}
