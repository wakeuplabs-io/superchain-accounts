import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import wakeUpEntrypointModule from "./EntryPoint";
import buildWakeUpPaymasterModule from "./Paymaster";
import buildWakeUpAccountFactoryModule from "./AccountFactory";

const wakeUpERC4337Module = buildModule("WakeUpERC4337", (m) => {
  //Deploy the entrypoint
  const { wakeUpEntryPoint } = m.useModule(wakeUpEntrypointModule);
  
  //Deploy the paymaster
  const { wakeUpPaymaster } = m.useModule(buildWakeUpPaymasterModule(wakeUpEntryPoint));

  // Deploy the account factory
  const { wakeUpAccountFactory } = m.useModule(buildWakeUpAccountFactoryModule(wakeUpEntryPoint));

  return { wakeUpEntryPoint, wakeUpPaymaster, wakeUpAccountFactory };
});

export default wakeUpERC4337Module;