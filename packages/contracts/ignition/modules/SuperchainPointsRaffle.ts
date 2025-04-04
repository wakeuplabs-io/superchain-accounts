import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SuperchainBadgesModule from "./SuperchainBadges";
import SuperchainPointsModule from "./SuperchainPoints";

const SuperchainPointsRaffleModule = buildModule("SuperchainPointsRaffleModule", (m) => {
  const owner = m.getParameter<string>("Owner");
  const superchainBadges = m.useModule(SuperchainBadgesModule)
  const superchainPoints = m.useModule(SuperchainPointsModule)
  

  const SuperchainPointsRaffle = m.contract("SuperchainPointsRaffle", [
    owner,
    superchainBadges.SuperchainBadges,
    superchainPoints.SuperchainPoints
  ]);

  return { SuperchainPointsRaffle };
});

export default SuperchainPointsRaffleModule;
