import { Address, http, PublicClient } from "viem";
import { SmartAccountHandler } from "./SmartAccountHandler";
import { createPaymasterClient } from "viem/account-abstraction";

export * from "./SmartAccountHandler";

export function createSmartAccountHandler({
  publicClient,
  bundlerUrl, 
  entrypointAddress, 
  smartAccountFactoryAddress, 
  paymasterClientUrl
}: { 
    publicClient: PublicClient,
    bundlerUrl: string, 
    entrypointAddress: Address, 
    smartAccountFactoryAddress: Address, 
    paymasterClientUrl: string
}): SmartAccountHandler {
  // instantiate the paymaster client
  const paymasterClient = createPaymasterClient({
    transport: http(paymasterClientUrl),
  });

  return new SmartAccountHandler(publicClient, entrypointAddress, smartAccountFactoryAddress, bundlerUrl, paymasterClient);
}