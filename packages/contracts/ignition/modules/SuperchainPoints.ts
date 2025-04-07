import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SuperchainPointsModule = buildModule("SuperchainPointsModule", (m) => {
  const owner = m.getParameter<string>("Owner");
  const name = m.getParameter<string>("Name");
  const symbol = m.getParameter<string>("Symbol");

  const SuperchainPoints = m.contract("SuperchainPoints", [
    owner,
    name,
    symbol,
  ]);

  return { SuperchainPoints };
});

export default SuperchainPointsModule;
