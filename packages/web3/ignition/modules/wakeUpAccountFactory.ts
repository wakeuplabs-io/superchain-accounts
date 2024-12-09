import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function buildWakeUpAccountFactoryModule(entryPoint: any) {
  const wakeUpAccountFactoryModule =  buildModule("WakeUpAccountFactoryModule", (m) => {
    const wakeUpAccountFactory = m.contract("SimpleAccountFactory", [entryPoint], { id: "wakeup_account_factory" });

    return { wakeUpAccountFactory };
  });

  return wakeUpAccountFactoryModule;
}