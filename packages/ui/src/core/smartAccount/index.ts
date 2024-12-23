import { Address, Chain, createPublicClient, http } from "viem";
import { SmartAccountHandler } from "./SmartAccountHandler";
import { createPaymasterClient } from "viem/account-abstraction";

export * from "./SmartAccountHandler";

export function createSmartAccountHandler({
  chain,
  bundlerUrl, 
  entrypointAddress, 
  smartAccountFactoryAddress, 
  paymasterClientUrl
}: { 
    chain: Chain,
    bundlerUrl: string, 
    entrypointAddress: Address, 
    smartAccountFactoryAddress: Address, 
    paymasterClientUrl: string
}): SmartAccountHandler {
  // instantiate the Public client
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  // instantiate the paymaster client
  const paymasterClient = createPaymasterClient({
    transport: http(paymasterClientUrl),
  });

  return new SmartAccountHandler(publicClient, entrypointAddress, smartAccountFactoryAddress, bundlerUrl, paymasterClient);
}