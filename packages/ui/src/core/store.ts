import { Chain } from "viem";
import { create } from "zustand";
import envParsed from "@/envParsed";
import { getLocalDevNetwork, INITIAL_NETWORK } from "@/core/network";
import { TorusAuthHandler } from "./auth";
import { createSmartAccountHandler, SmartAccountHandler } from "./smartAccount";

const environment = envParsed();

type SuperChainStore = {
    chain: Chain,
    authHandler: TorusAuthHandler,
    smartAccountHandler: SmartAccountHandler,
}

type SuperChainActions = {
    updateChain: (chain: SuperChainStore["chain"]) => void
}

type SuperChainStoreType = SuperChainStore & SuperChainActions;

const initialChain = environment.LOCAL_DEV ? getLocalDevNetwork() : INITIAL_NETWORK;
const authMode = environment.LOCAL_DEV ? "local" : environment.DEV ? "development" : "production";

export const useSuperChainStore = create<SuperChainStoreType >((set) => ({
  chain: initialChain,
  authHandler: new TorusAuthHandler(initialChain, authMode),
  smartAccountHandler: createSmartAccountHandler({
    chain: initialChain,
    bundlerUrl: environment.BUNDLER_URL,
    entrypointAddress: environment.ENTRYPOINT_ADDRESS,
    smartAccountFactoryAddress: environment.SMART_ACCOUNT_FACTORY_ADDRESS,
    paymasterClientUrl: environment.PAYMASTER_CLIENT_URL,
  }),
  updateChain: (chain) => set({ chain }),
}));