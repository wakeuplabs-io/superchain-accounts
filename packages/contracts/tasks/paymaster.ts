import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("deposit-paymaster", "Deposits funds into the paymaster")
  .addParam("amount", "Amount of points to mint")
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const chain = await hre.ethers.provider.getNetwork();
      const deployed_addresses = require(
        `../ignition/deployments/chain-${chain.chainId}/deployed_addresses.json`
      );
      const paymasterAddress = deployed_addresses["WakeUpPaymasterModule#wakeup_paymaster"];
      const paymaster = await hre.ethers.getContractAt("WakeUpPaymaster", paymasterAddress);

      console.log(`Depositing ${taskArguments.amount} to paymaster`);

      const tx = await paymaster.deposit({
        value: BigInt(taskArguments.amount),
      })

      console.log(`Points minted with tx: ${tx.hash}`);
    }
  );