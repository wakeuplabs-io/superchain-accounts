import {Chain, optimism, optimismSepolia} from "viem/chains";
import envParsed from "../envParsed";

export const supportedChains: Record<string, Chain> = {
  "optimism": optimism,
  "optimismSepolia": optimismSepolia
};

export const INITIAL_NETWORK = envParsed().PROD ? supportedChains["optimism"] : supportedChains["optimismSepolia"];