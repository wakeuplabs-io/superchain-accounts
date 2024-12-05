import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function buildWakeUpPaymasterModule(entryPoint: any) {
  const paymasterModule =  buildModule("WakeUpPaymasterModule", (m) => {
    const wakeUpPaymaster = m.contract("WakeUpPaymaster", [entryPoint], { id: "wakeup_paymaster" });

    return { wakeUpPaymaster };
  });

  return paymasterModule;
}