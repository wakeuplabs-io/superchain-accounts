import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, CustomChainConfig } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

import { Chain } from "viem";
import envParsed from "@/envParsed";
import { EthereumProvider } from "node_modules/permissionless/_types/utils/toOwner";

export class Web3AuthHandler {
  private web3auth: Web3Auth;
  private provider: IProvider | null = null;

  constructor(
    private chain: Chain,
    private readonly mode: "development" | "production" | "local" = "production"
  ) {
    const chainConfig: CustomChainConfig = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: `0x${chain.id.toString(16)}`,
      rpcTarget: this.chain.rpcUrls.default.http[0],
      displayName: chain.name,
      blockExplorerUrl: chain.blockExplorers?.default?.url || "",
      ticker: chain.nativeCurrency.symbol,
      tickerName: chain.nativeCurrency.name,
    };

    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: { chainConfig },
    });

    this.web3auth = new Web3Auth({
      clientId: envParsed().WEB3_AUTH_CLIENT_ID,
      web3AuthNetwork: this.mode === "production" ? "mainnet" : "testnet",
      chainConfig,
      privateKeyProvider,
    });
  }

  async getUserName() {
    if (!this.isInitialized() || !this.isLoggedIn()) {
      return;
    }

    return (await this.web3auth.getUserInfo()).name;
  }

  async getUserEmail() {
    if (!this.isInitialized() || !this.isLoggedIn()) {
      return;
    }

    return (await this.web3auth.getUserInfo()).email;
  }

  async initialize() {
    if (!this.web3auth.connected) {
      await this.web3auth.initModal();
    }
  }

  async login() {
    if (!this.isInitialized()) {
      await this.initialize();
    }
    this.provider = await this.web3auth.connect();
  }

  async logout() {
    if (!this.isInitialized() || !this.isLoggedIn()) {
      return;
    }
    await this.web3auth.logout();
    this.provider = null;
  }

  isLoggedIn() {
    return this.web3auth.connected;
  }

  isInitialized() {
    return this.web3auth.status === "ready";
  }

  getProvider() {
    if (!this.provider) {
      throw new Error("Provider not initialized. Please login first.");
    }
    // The provider from Web3Auth should already be compatible with EthereumProvider
    return this.provider as EthereumProvider;
  }
}
