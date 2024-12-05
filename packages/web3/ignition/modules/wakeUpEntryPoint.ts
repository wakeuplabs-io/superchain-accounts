import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const wakeUpEntryPointModule = buildModule("WakeUpEntryPointModule", (m) => {
  const wakeUpEntryPoint = m.contract("EntryPoint", [], { id: "wakeup_entrypoint" });

  return { wakeUpEntryPoint };
});

export default wakeUpEntryPointModule;