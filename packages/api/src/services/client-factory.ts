import { OWNER_PRIVATE_KEY, TRANSPORTS_URLS } from "@/config/blockchain";
import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export interface IClientFactory {
  getReadClient(chainId: string): PublicClient;
  getWriteClient(chainId: string, privateKey: `0x${string}`): WalletClient;
}

// Why this? 
// I think It would be more useful to have a single client for each chainId passing the chainId in the constructor
// TODO: see sdk implementation and discuss in archi meeting
export class ClientFactory implements IClientFactory {
  publicClients: {
    [chainId: string]: PublicClient | undefined;
  } = {};
  walletClients: Record<`${string}:${string}`, WalletClient | undefined> = {};

  getReadClient(chainId: string): PublicClient {
    if (this.publicClients[chainId]) {
      return this.publicClients[chainId] as PublicClient;
    }

    this.publicClients[chainId] = createPublicClient({
      transport: http(TRANSPORTS_URLS[chainId]),
    });

    return this.publicClients[chainId] as PublicClient;
  }

  getWriteClient(chainId: string, privateKey: `0x${string}`): WalletClient {
    if (!this.walletClients[`${chainId}:${privateKey}`]) {
      const account = privateKeyToAccount(privateKey);
      this.walletClients[`${chainId}:${privateKey}`] = createWalletClient({
        account,
        transport: http(TRANSPORTS_URLS[chainId]),
      });
    }

    return this.walletClients[`${chainId}:${privateKey}`]!;
  }
}
