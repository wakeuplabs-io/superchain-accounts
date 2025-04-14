import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SuperchainBadgesModule = buildModule("SuperchainBadgesModule", (m) => {
  const owner = m.getParameter<string>("Owner");
  const baseUri = m.getParameter<string>("BaseURI");

  const SuperchainBadges = m.contract("SuperchainBadges", [owner]);

  m.call(SuperchainBadges, "setURI", [1, `${baseUri}-1.json`], { id: "setURI_1" });
  m.call(SuperchainBadges, "setURI", [2, `${baseUri}-2.json`], { id: "setURI_2" });
  m.call(SuperchainBadges, "setURI", [3, `${baseUri}-3.json`], { id: "setURI_3" });
  m.call(SuperchainBadges, "setURI", [4, `${baseUri}-4.json`], { id: "setURI_4" });
  m.call(SuperchainBadges, "setURI", [5, `${baseUri}-5.json`], { id: "setURI_5" });
  m.call(SuperchainBadges, "setURI", [6, `${baseUri}-6.json`], { id: "setURI_6" });
  m.call(SuperchainBadges, "setURI", [7, `${baseUri}-7.json`], { id: "setURI_7" });
  m.call(SuperchainBadges, "setURI", [8, `${baseUri}-8.json`], { id: "setURI_8" });
  m.call(SuperchainBadges, "setURI", [9, `${baseUri}-9.json`], { id: "setURI_9" });


  return { SuperchainBadges };
});

export default SuperchainBadgesModule;