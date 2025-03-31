import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const wakeUpEntryPointSimulationsModule = buildModule("WakeUpEntryPointSimulationsModule", (m) => {
  const wakeUpEntryPointSimulations = m.contract("WakeUpEntryPointSimulations", [], { id: "wakeup_entrypoint_simulations" });

  return { wakeUpEntryPointSimulations };
});

export default wakeUpEntryPointSimulationsModule;