import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const { ethers } = hre;

async function deploySuperchainPointsRaffleFixture() {
  const [owner, addr1, addr2] = await ethers.getSigners();

  const SuperchainPoints = await ethers.getContractFactory("SuperchainPoints");
  const superchainPoints = await SuperchainPoints.deploy(
    owner.address,
    "Superchain Points",
    "SCP"
  );
  const SuperchainBadges = await ethers.getContractFactory("SuperchainBadges");
  const superchainBadges = await SuperchainBadges.deploy(owner.address);

  const SuperchainPointsRaffleFactory = await ethers.getContractFactory(
    "SuperchainPointsRaffleFactory"
  );
  const superchainPointsRaffleFactory =
    await SuperchainPointsRaffleFactory.deploy(
      owner.address,
      await superchainPoints.getAddress(),
      await superchainBadges.getAddress()
    );

  // mint points for owner
  await superchainPoints.connect(owner).mint(owner.address, 1_000_000_000n);
  await superchainPoints
    .connect(owner)
    .approve(
      await superchainPointsRaffleFactory.getAddress(),
      ethers.MaxUint256
    );

  return {
    superchainPoints,
    superchainBadges,
    superchainPointsRaffleFactory,
    owner,
    addr1,
    addr2,
  };
}

describe("SuperchainPointsRaffleFactory", function () {
  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { superchainPointsRaffleFactory, owner } = await loadFixture(
        deploySuperchainPointsRaffleFixture
      );
      expect(await superchainPointsRaffleFactory.owner()).to.equal(
        owner.address
      );
    });
  });

  describe("RaffleFactory", function () {
    it("Should create a raffle and with factory owner", async function () {
      const { superchainPointsRaffleFactory, owner } = await loadFixture(
        deploySuperchainPointsRaffleFixture
      );

      // Verify no raffle before creation
      expect(await superchainPointsRaffleFactory.currentRaffle()).to.equal(
        ethers.ZeroAddress
      );

      // Create raffle and verify owner
      await superchainPointsRaffleFactory.connect(owner).createRaffle();
      const raffle = await hre.ethers.getContractAt(
        "SuperchainPointsRaffle",
        await superchainPointsRaffleFactory.currentRaffle()
      );
      expect(await raffle.owner()).to.equal(owner.address);
    });

    it("Cannot create a raffle if one is already ongoing", async function () {
      const { superchainPointsRaffleFactory, owner } = await loadFixture(
        deploySuperchainPointsRaffleFixture
      );

      // first raffle
      await superchainPointsRaffleFactory.connect(owner).createRaffle();
      const raffle = await hre.ethers.getContractAt(
        "SuperchainPointsRaffle",
        await superchainPointsRaffleFactory.currentRaffle()
      );
      expect(await raffle.isFinished()).to.equal(false);

      // second raffle should fail as first is ongoing
      await expect(
        superchainPointsRaffleFactory.connect(owner).createRaffle()
      ).to.be.revertedWithCustomError(
        superchainPointsRaffleFactory,
        "OngoingRaffle"
      );
    });

    it("Can create a raffle if previous one finished", async function () {
      const {
        superchainPointsRaffleFactory,
        owner,
        addr1,
        superchainBadges,
        superchainPoints,
      } = await loadFixture(deploySuperchainPointsRaffleFixture);

      // Create raffle and verify owner
      await superchainPointsRaffleFactory.connect(owner).createRaffle();
      const raffleAddress = await superchainPointsRaffleFactory.currentRaffle();

      const raffle = await hre.ethers.getContractAt(
        "SuperchainPointsRaffle",
        raffleAddress
      );
      await superchainPoints.approve(raffleAddress, ethers.MaxUint256);
      const seed = ethers.encodeBytes32String("demo");
      await raffle
        .connect(owner)
        .initialize(sealSeed(seed, owner.address), 10n, [1n, 2n], [10n, 100n]);

      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await raffle.connect(addr1).claimTickets();

      await raffle.connect(owner).revealWinner(seed);

      await expect(superchainPointsRaffleFactory.connect(owner).createRaffle())
        .not.to.be.reverted;
    });
  });

  it.only("DEMO", async function () {
    const { superchainPointsRaffleFactory: raffleFactory, superchainPoints: token, superchainBadges, owner } = await loadFixture(
      deploySuperchainPointsRaffleFixture
    );

    const taskArguments = {
      prize: 10n,
      badges: "1,2",
      allocations: "10,100",
    }

    const [signer] = await hre.ethers.getSigners();
    if ((await raffleFactory.owner()) !== signer.address) {
      throw new Error("You are not the owner of the raffle");
    }

    // Mint points for raffle
    console.log(
      `Minting ${taskArguments.prize} points to ${signer.address} for raffle deposit`
    );
    const txMint = await token.mint(
      signer.address,
      BigInt(taskArguments.prize)
    );
    console.log(`Points minted with tx: ${txMint.hash}`);

    // Create raffle
    console.log("Creating raffle");
    const tx = await raffleFactory.createRaffle();
    console.log("Raffle created with tx: ", tx.hash);

    // Instantiate raffle
    const raffleAddress = await raffleFactory.currentRaffle();
    console.log("raffleAddress", raffleAddress)
    const raffle = await hre.ethers.getContractAt(
      "SuperchainPointsRaffle",
      raffleAddress
    );

    // approve
    console.log("Approving raffle");
    await token.approve(raffleAddress, hre.ethers.MaxUint256);
    console.log("Approved");

    // Create raffle seed
    const seed = hre.ethers.hexlify(hre.ethers.randomBytes(32));
    console.log("Raffle seed:", seed);
    console.log("Keep it safe, you'll need it later for revelation!");
    // const seed = "0x1918b840defc05910aca2983c89a14c27a5152fca440f09b3c6f7ec2817af201"

    //  Start raffle
    console.log("Starting raffle");
    console.log("Params",
      hre.ethers.keccak256(
        hre.ethers.solidityPacked(
          ["address", "bytes32"],
          [signer.address, seed]
        )
      ),
      BigInt(taskArguments.prize),
      taskArguments.badges.split(",").map(BigInt),
      taskArguments.allocations.split(",").map(BigInt)
    )

    console.log("owner", await raffle.owner());

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
  })
});

function sealSeed(seed: string, owner: string) {
  return ethers.keccak256(
    ethers.solidityPacked(["address", "bytes32"], [owner, seed])
  );
}
