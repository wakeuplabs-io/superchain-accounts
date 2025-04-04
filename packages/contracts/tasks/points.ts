import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("mint-points", "Mints points to a specified address")
  .addParam("amount", "Amount of points to mint")
  .addParam("to", "The address to mint tokens to")
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const chain = await hre.ethers.provider.getNetwork();
      const deployed_addresses = require(
        `../ignition/deployments/chain-${chain.chainId}/deployed_addresses.json`
      );
      const tokenAddress = deployed_addresses["SuperchainPointsModule#SuperchainPoints"];
      const token = await hre.ethers.getContractAt("SuperchainPoints", tokenAddress);

      console.log(`Minting ${taskArguments.amount} points to ${taskArguments.to}`);

      const tx = await token.mint(taskArguments.to, BigInt(taskArguments.amount));

      console.log(`Points minted with tx: ${tx.hash}`);
    }
  );