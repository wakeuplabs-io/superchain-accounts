import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SuperchainBadgesModule = buildModule("SuperchainBadgesModule", (m) => {
  const owner = m.getParameter<string>("Owner");
  const baseUri = m.getParameter<string>("BaseURI");

  const SuperchainBadges = m.contract("SuperchainBadges", [owner]);

  m.call(SuperchainBadges, "setURI", [1, baseUri + "-1.json"]);
  m.call(SuperchainBadges, "setURI", [2, baseUri + "-2.json"]);
  m.call(SuperchainBadges, "setURI", [3, baseUri + "-3.json"]);
  m.call(SuperchainBadges, "setURI", [4, baseUri + "-4.json"]);
  m.call(SuperchainBadges, "setURI", [5, baseUri + "-5.json"]);
  m.call(SuperchainBadges, "setURI", [6, baseUri + "-6.json"]);
  m.call(SuperchainBadges, "setURI", [7, baseUri + "-7.json"]);
  m.call(SuperchainBadges, "setURI", [8, baseUri + "-8.json"]);
  m.call(SuperchainBadges, "setURI", [9, baseUri + "-9.json"]);


  return { SuperchainBadges };
});

export default SuperchainBadgesModule;