import {Chain, optimism, optimismSepolia} from "viem/chains";
import envParsed from "../envParsed";

export const supportedChains: Record<string, Chain> = {
  "optimism": optimism,
  "optimismSepolia": optimismSepolia
};

export const INITIAL_NETWORK = envParsed().PROD ? supportedChains["optimism"] : supportedChains["optimismSepolia"];

export function getLocalDevNetwork(): Chain {
  const environment = envParsed();

  if (!environment.LOCAL_DEV) {
    throw new Error("Local DEV not enabled");
  }

  if (!environment.LOCAL_CHAIN_ID || !environment.LOCAL_CHAIN_NAME || !environment.LOCAL_RPC_URL) {
    throw new Error("Missing local configs");
  }

  return {
    id: environment.LOCAL_CHAIN_ID,
    name: environment.LOCAL_CHAIN_NAME,
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: [environment.LOCAL_RPC_URL],
        webSocket: [environment.LOCAL_RPC_URL],
      },
    },
  };
}