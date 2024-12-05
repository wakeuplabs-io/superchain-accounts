import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import wakeUpEntrypointModule from "./wakeUpEntryPoint";
import buildWakeUpPaymasterModule from "./wakeUpPaymaster";

const wakeUpERC4337Module = buildModule("WakeUpERC4337", (m) => {
  //Deploy the entrypoint
  const { wakeUpEntryPoint } = m.useModule(wakeUpEntrypointModule);
  
  //Deploy the paymaster
  const { wakeUpPaymaster } = m.useModule(buildWakeUpPaymasterModule(wakeUpEntryPoint));

  return { wakeUpEntryPoint, wakeUpPaymaster };
});

export default wakeUpERC4337Module;