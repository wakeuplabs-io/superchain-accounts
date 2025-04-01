import { Address, PublicClient } from "viem";
import { SmartAccountHandler } from "./SmartAccountHandler";

export * from "./SmartAccountHandler";

export function createSmartAccountHandler({
  publicClient,
  pimlicoUrl, 
  entrypointAddress,
}: { 
    publicClient: PublicClient,
    pimlicoUrl: string,
    entrypointAddress: Address,
}): SmartAccountHandler {

  return new SmartAccountHandler(publicClient, pimlicoUrl, entrypointAddress);
}