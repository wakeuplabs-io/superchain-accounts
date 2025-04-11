import { BundlerClient, createBundlerClient } from "viem/account-abstraction";
import { ClientFactory, IClientFactory } from "./client-factory";
import { http } from "viem";
import { SMART_ACCOUNTS } from "@/config/blockchain";

// same to other interfaces
export interface IBundlerFactory {
  getBundler(chainId: string): BundlerClient;
}

export class BundlerFactory implements IBundlerFactory {
  clients: {
    [chainId: string]: BundlerClient | undefined;
  } = {};

  constructor(private clientFactory: IClientFactory) {}

  getBundler(chainId: string): BundlerClient {
    if (this.clients[chainId]) {
      return this.clients[chainId] as BundlerClient;
    }

    this.clients[chainId] = createBundlerClient({
      client: this.clientFactory.getReadClient(chainId),
      transport: http(SMART_ACCOUNTS[chainId].bundlerUrl),
    });

    return this.clients[chainId] as BundlerClient;
  }
}
