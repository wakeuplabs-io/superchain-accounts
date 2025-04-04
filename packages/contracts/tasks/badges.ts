import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("mint-badge", "Mints badge to a specified address")
  .addParam("id", "Badge id to mint")
  .addParam("to", "The address to mint tokens to")
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const chain = await hre.ethers.provider.getNetwork();
      const deployed_addresses = require(`../ignition/deployments/chain-${chain.chainId}/deployed_addresses.json`);
      const tokenAddress =
        deployed_addresses["SuperchainBadgesModule#SuperchainBadges"];
      const token = await hre.ethers.getContractAt(
        "SuperchainBadges",
        tokenAddress
      );

      console.log(`Minting badge ${taskArguments.id} to ${taskArguments.to}`);

      const tx = await token.mint(taskArguments.to, taskArguments.id);

      console.log(`Badge minted with tx: ${tx.hash}`);
    }
  );

task("set-badge-uri", "Sets badge uri")
  .addParam("id", "Badge id")
  .addParam("uri", "Badge uri")
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const chain = await hre.ethers.provider.getNetwork();
      const deployed_addresses = require(`../ignition/deployments/chain-${chain.chainId}/deployed_addresses.json`);
      const tokenAddress =
        deployed_addresses["SuperchainBadgesModule#SuperchainBadges"];
      const token = await hre.ethers.getContractAt(
        "SuperchainBadges",
        tokenAddress
      );

      console.log(
        `Updating badge ${taskArguments.id} uri to ${taskArguments.uri}`
      );

      const tx = await token.setURI(taskArguments.id, taskArguments.uri);

      console.log(`Updated with tx: ${tx.hash}`);
    }
  );
