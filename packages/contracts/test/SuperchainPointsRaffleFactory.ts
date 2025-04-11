import hre from "hardhat";
import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

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
    it("Should create a raffle with factory owner as raffle owner", async function () {
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

      expect(await raffle.isOngoing()).to.equal(false);
      expect(
        await raffle.initialize(
          hre.ethers.hexlify(hre.ethers.randomBytes(32)),
          0,
          0,
          [],
          []
        )
      ).not.to.be.reverted;
      expect(await raffle.isOngoing()).to.equal(true);

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

      // approve raffle
      const raffle = await hre.ethers.getContractAt(
        "SuperchainPointsRaffle",
        raffleAddress
      );
      await superchainPoints.approve(raffleAddress, ethers.MaxUint256);

      const seed = ethers.encodeBytes32String("demo");
      const revealAfter = await time.latest() + 24 * 60 * 60;

      // initialize raffle
      await raffle
        .connect(owner)
        .initialize(
          sealSeed(seed, owner.address),
          revealAfter,
          10n,
          [1n, 2n],
          [10n, 100n]
        );

      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await raffle.connect(addr1).claimTickets();

      // reveal winner
      await time.increaseTo(revealAfter);
      await raffle.connect(owner).revealWinner(seed);

      await expect(superchainPointsRaffleFactory.connect(owner).createRaffle())
        .not.to.be.reverted;
    });
  });
});

function sealSeed(seed: string, owner: string) {
  return ethers.keccak256(
    ethers.solidityPacked(["address", "bytes32"], [owner, seed])
  );
}
