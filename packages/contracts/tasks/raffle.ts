import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("start-raffle", "Starts a raffle")
  .addParam("prize", "Amount of points for prize")
  .addParam("badges", "Badges that can participate separated by comma")
  .addParam("allocations", "Badge allocations separated by comma")
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const chain = await hre.ethers.provider.getNetwork();
      const deployed_addresses = require(
        `../ignition/deployments/chain-${chain.chainId}/deployed_addresses.json`
      );

      // Instantiate points
      const tokenAddress =
        deployed_addresses["SuperchainPointsModule#SuperchainPoints"];
      const token = await hre.ethers.getContractAt(
        "SuperchainPoints",
        tokenAddress
      );

      // Instantiate raffle
      const raffleAddress =
        deployed_addresses[
          "SuperchainPointsRaffleModule#SuperchainPointsRaffle"
        ];
      const raffle = await hre.ethers.getContractAt(
        "SuperchainPointsRaffle",
        raffleAddress
      );

      const [signer] = await hre.ethers.getSigners();
      if ((await raffle.owner()) !== signer.address) {
        throw new Error("You are not the owner of the raffle");
      }

      // Mint points for raffle
      console.log(
        `Minting ${taskArguments.prize} points to ${signer.address} for raffle deposit`
      );
      const txMint = await token.mint(
        taskArguments.to,
        BigInt(taskArguments.amount)
      );
      console.log(`Points minted with tx: ${txMint.hash}`);

      // approve
      console.log("Approving raffle");
      await token.approve(raffleAddress, hre.ethers.MaxUint256);
      console.log("Approved");

      // Create raffle seed
      const seed = hre.ethers.hexlify(hre.ethers.randomBytes(32));
      console.log("Raffle seed:", seed);
      console.log("Keep it safe, you'll need it later for revelation!");

      //  Start raffle
      console.log("Starting raffle");
      const txStart = await raffle.initialize(
        hre.ethers.keccak256(
          hre.ethers.solidityPacked(
            ["address", "bytes32"],
            [signer.address, seed]
          )
        ),
        BigInt(taskArguments.prize),
        taskArguments.badges.split(",").map(BigInt),
        taskArguments.allocations.split(",").map(BigInt)
      );
      console.log(`Raffle started with tx: ${txStart.hash}`);
    }
  );

task("finish-raffle", "Finishes a raffle")
  .addParam("seed", "Seed for raffle")
  .setAction(
    async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
      const chain = await hre.ethers.provider.getNetwork();
      const deployed_addresses = require(
        `../ignition/deployments/chain-${chain.chainId}/deployed_addresses.json`
      );

      // Instantiate raffle
      const raffleAddress =
        deployed_addresses[
          "SuperchainPointsRaffleModule#SuperchainPointsRaffle"
        ];
      const raffle = await hre.ethers.getContractAt(
        "SuperchainPointsRaffle",
        raffleAddress
      );

      const [signer] = await hre.ethers.getSigners();
      if ((await raffle.owner()) !== signer.address) {
        throw new Error("You are not the owner of the raffle");
      }

      //  Finish raffle
      console.log("Revealing winner");
      const txStart = await raffle.revealWinner(taskArguments.seed);
      console.log(`Winner revealed with tx: ${txStart.hash}`);
    }
  );

task("claim-raffle", "Claim raffle tickets").setAction(
  async (taskArguments: TaskArguments, hre: HardhatRuntimeEnvironment) => {
    const chain = await hre.ethers.provider.getNetwork();
    const deployed_addresses = require(
      `../ignition/deployments/chain-${chain.chainId}/deployed_addresses.json`
    );

    // Instantiate raffle
    const raffleAddress =
      deployed_addresses["SuperchainPointsRaffleModule#SuperchainPointsRaffle"];
    const raffle = await hre.ethers.getContractAt(
      "SuperchainPointsRaffle",
      raffleAddress
    );

    //  Claim tickets
    console.log("Claiming raffle tickets");
    const txStart = await raffle.claimTickets();
    console.log(`Claimed with tx: ${txStart.hash}`);
  }
);
