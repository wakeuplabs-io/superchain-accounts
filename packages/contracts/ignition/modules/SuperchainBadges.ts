import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SuperchainBadgesModule = buildModule("SuperchainBadgesModule", (m) => {
  const owner = m.getParameter<string>("Owner");

  const SuperchainBadges = m.contract("SuperchainBadges", [owner]);

  return { SuperchainBadges };
});

export default SuperchainBadgesModule;