import { Chain, http, createPublicClient as instantiatePublicClient, PublicClient } from "viem";

export * from "./networks";
export * from "./smartAccount";
export * from "./client";

// TODO: i'm pretty sure this is not the right way to create a public client, could we do it the standard way?
// TODO: also, we don't need a separate file for this.

export function createPublicClient(chain: Chain): PublicClient {
  return instantiatePublicClient({
    chain,
    transport: http(),
  });
}