import { Chain } from "viem";
import { create } from "zustand";
import { getLocalDevNetwork, INITIAL_NETWORK } from "../network";
import { TorusAuthHandler } from "./auth";
import envParsed from "@/envParsed";

const environment = envParsed();

type SuperChainStore = {
    chain: Chain,
    authHandler: TorusAuthHandler,
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
  updateChain: (chain) => set({ chain }),
}));