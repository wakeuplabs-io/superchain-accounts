import { Chain } from "viem";
import { create } from "zustand";
import envParsed from "../envParsed";
import { supportedChains } from "../network";

type SuperChainStore = {
    chain: Chain 
}

type SuperChainActions = {
    updateChain: (chain: SuperChainStore["chain"]) => void
}

export const useSuperChainStore = create<SuperChainStore & SuperChainActions>((set) => ({
  chain: envParsed().ENVIRONMENT === "production" ? supportedChains["optimism"] : supportedChains["optimismSepolia"],
  updateChain: (chain) => set({ chain })
}));