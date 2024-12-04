import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { Address } from "viem";

export default function buildWakeUpPaymasterModule(entryPoint: Address) {
  const paymasterModule =  buildModule("WakeUpPaymasterModule", (m) => {
    const wakeUpPaymaster = m.contract("WakeUpPaymaster", [entryPoint]);

    return { wakeUpPaymaster };
  });

  return paymasterModule;
}