import { defineChain } from "viem";
import envParsed  from "../envParsed";

const envVars = envParsed();

export function getLocalOpChain() {
  if (!envVars.LOCAL_CHAIN_ID || !envVars.LOCAL_CHAIN_NAME || !envVars.LOCAL_RPC_URL) {
    throw new Error("Missing local configs");
  }

  return defineChain({
    id: envVars.LOCAL_CHAIN_ID,
    name: envVars.LOCAL_CHAIN_NAME,
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: [envVars.LOCAL_RPC_URL],
        webSocket: [envVars.LOCAL_RPC_URL],
      },
    },
  });
}
