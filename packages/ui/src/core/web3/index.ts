import { Chain, http, createPublicClient as instantiatePublicClient, PublicClient } from "viem";

export * from "./networks";
export * from "./smartAccount";
export * from "./client";

 
export function createPublicClient(chain: Chain): PublicClient {
  return instantiatePublicClient({
    chain,
    transport: http(),
  });
}