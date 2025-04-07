import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import SuperchainBadgesModule from "./SuperchainBadges";
import SuperchainPointsModule from "./SuperchainPoints";

const SuperchainPointsRaffleFactoryModule = buildModule("SuperchainPointsRaffleFactoryModule", (m) => {
  const owner = m.getParameter<string>("Owner");
  const superchainBadges = m.useModule(SuperchainBadgesModule)
  const superchainPoints = m.useModule(SuperchainPointsModule)
  

  const SuperchainPointsRaffleFactory = m.contract("SuperchainPointsRaffleFactory", [
    owner,
    superchainBadges.SuperchainBadges,
    superchainPoints.SuperchainPoints
  ]);

  return { SuperchainPointsRaffleFactory };
});

export default SuperchainPointsRaffleFactoryModule;
