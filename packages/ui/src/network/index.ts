import {Chain, optimism, optimismSepolia} from "viem/chains";

export const supportedChains: Record<string, Chain> = {
  "optimism": optimism,
  "optimismSepolia": optimismSepolia
};