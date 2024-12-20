import { Chain } from "viem";
import { create } from "zustand";
import { INITIAL_NETWORK } from "../network";
import { TorusAuthHandler } from "./auth";
import envParsed from "@/envParsed";

type SuperChainStore = {
    chain: Chain,
    authHandler: TorusAuthHandler,
}

type SuperChainActions = {
    updateChain: (chain: SuperChainStore["chain"]) => void
}

type SuperChainStoreType = SuperChainStore & SuperChainActions;

export const useSuperChainStore = create<SuperChainStoreType >((set) => ({
  chain: INITIAL_NETWORK,
  authHandler: new TorusAuthHandler(INITIAL_NETWORK, envParsed().DEV),
  updateChain: (chain) => set({ chain }),
}));