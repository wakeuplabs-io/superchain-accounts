import { Chain } from "viem";
import { create } from "zustand";
import envParsed from "@/envParsed";
import { TorusAuthHandler } from "./auth";
import {
  createPublicClient,
  getLocalDevNetwork,
  INITIAL_NETWORK,
  Web3Client,
  createSmartAccountHandler,
  SmartAccountHandler,
} from "@/core/web3";
import { ApiClient } from "@/lib/utils";

const environment = envParsed();

type SuperChainStore = {
  chain: Chain;
  authHandler: TorusAuthHandler;
  smartAccountHandler: SmartAccountHandler;
  web3Client: Web3Client;
  web2Client: ApiClient;
};

type SuperChainActions = {
  updateChain: (chain: SuperChainStore["chain"]) => void;
};

type SuperChainStoreType = SuperChainStore & SuperChainActions;

const initialChain = environment.LOCAL_DEV
  ? getLocalDevNetwork()
  : INITIAL_NETWORK;
const authMode = environment.LOCAL_DEV
  ? "local"
  : environment.DEV
    ? "development"
    : "production";

//instantiate the public client
const publicClient = createPublicClient(initialChain);

class MockAuthHandler {
  torus: any;
  chain: Chain;
  mode: any;

  constructor(chain: Chain, mode: any) {
    this.chain = chain;
    this.mode = mode;
    this.torus = {};
  }

  async init(): Promise<void> {
    return Promise.resolve();
  }

  async login(): Promise<{
    privateKey: `0x${string}`;
    publicAddress: `0x${string}`;
    email: string;
    name: string;
  }> {
    return Promise.resolve({
      privateKey: "0xMockPrivateKey" as `0x${string}`,
      publicAddress: "0xMockAddress" as `0x${string}`,
      email: "mock@example.com",
      name: "Mock User",
    });
  }

  async logout(): Promise<void> {
    return Promise.resolve();
  }

  getUserName(): string {
    return "Mock User";
  }

  getUserEmail(): string {
    return "mock@example.com";
  }

  getUserInfo(): any {
    return {
      email: this.getUserEmail(),
      name: this.getUserName(),
      profileImage: "https://api.dicebear.com/7.x/personas/svg?seed=mock",
    };
  }

  isLoggedIn(): boolean {
    return true;
  }

  getPublicAddress(): `0x${string}` {
    return "0xMockAddress" as `0x${string}`;
  }

  getPrivateKey(): `0x${string}` {
    return "0xMockPrivateKey" as `0x${string}`;
  }

  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  getProvider(): any {
    return this.torus.provider;
  }
}

export const useSuperChainStore = create<SuperChainStoreType>((set) => ({
  chain: initialChain,
  //authHandler: new TorusAuthHandler(initialChain, authMode),
  authHandler: new MockAuthHandler(
    initialChain,
    authMode
  ) as unknown as TorusAuthHandler,
  smartAccountHandler: createSmartAccountHandler({
    publicClient,
    bundlerUrl: environment.BUNDLER_URL,
    entrypointAddress: environment.ENTRYPOINT_ADDRESS,
    smartAccountFactoryAddress: environment.SMART_ACCOUNT_FACTORY_ADDRESS,
    paymasterClientUrl: environment.PAYMASTER_CLIENT_URL,
  }),
  web3Client: new Web3Client(publicClient),
  web2Client: new ApiClient(),
  updateChain: (chain) => set({ chain }),
}));