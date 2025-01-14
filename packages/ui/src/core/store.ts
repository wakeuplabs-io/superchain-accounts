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

export const useSuperChainStore = create<SuperChainStoreType>((set) => ({
  chain: initialChain,
  authHandler: new TorusAuthHandler(initialChain, authMode),
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