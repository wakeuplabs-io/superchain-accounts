import { Chain } from "viem";
import Torus from "@toruslabs/torus-embed";

// TODO: is this really necessary if we are using web3auth?????

export class TorusAuthHandler {
  private torus: Torus;
  
  constructor(private chain: Chain, private readonly mode: "development" | "production" | "local" = "production") {
    this.torus = new Torus({
      buttonPosition: "bottom-right",
    });
  }

  async initialize() {
    const testEnvironment = this.mode === "development" || this.mode === "local";
    const showTorusButton = this.mode === "local";
    if (!this.torus.isInitialized) {
      console.log("Initializing Torus...");
      console.log("Chain ID: ", this.chain.id);
      console.log("Chain Name: ", this.chain.name);
      console.log("RPC URL: ", this.chain.rpcUrls.default.http[0]);
      await this.torus.init({
        showTorusButton: showTorusButton,
        network: {
          host: this.chain.rpcUrls.default.http[0],
          chainId: this.chain.id,
          networkName: this.chain.name,
        },
        enableLogging: testEnvironment,
        buildEnv: testEnvironment ? "testing" : "production",
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