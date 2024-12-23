import { Chain } from "viem";
import Torus from "@toruslabs/torus-embed";

export class TorusAuthHandler {
  private torus: Torus;
  
  constructor(private chain: Chain, private readonly devMode = false) {
    this.torus = new Torus({
      buttonPosition: "bottom-right",
    });
  }

  async initialize() {
    if (!this.torus.isInitialized) {
      await this.torus.init({
        showTorusButton: false,
        network: {
          host: this.chain.rpcUrls.default.http[0],
          chainId: this.chain.id,
          networkName: this.chain.name,
        },
        enableLogging: this.devMode,
        buildEnv: this.devMode ? "testing" : "production",
      });
    }
  }

  async login() {
    this.torus.clearInit();

    await this.initialize();

    await this.torus.login();
  }

  async logout() {
    if(!this.isInitialized() || !this.isLoggedIn()) {
      return;
    }

    await this.torus.logout();
  }

  async updateChain(chain: Chain) {
    this.chain = chain;

    await this.torus.setProvider({
      host: this.chain.rpcUrls.default.http[0],
      chainId: this.chain.id,
      networkName: this.chain.name,
    });
  }

  isLoggedIn() {
    return this.torus.isLoggedIn;
  }

  isInitialized() {
    return this.torus.isInitialized;
  }

  getProvider() {
    return this.torus.provider;
  }
}