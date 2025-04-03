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

  const SuperchainPointsRaffle = await ethers.getContractFactory(
    "SuperchainPointsRaffle"
  );
  const superchainPointsRaffle = await SuperchainPointsRaffle.deploy(
    owner.address,
    await superchainPoints.getAddress(),
    await superchainBadges.getAddress()
  );

  return {
    superchainPoints,
    superchainBadges,
    superchainPointsRaffle,
    owner,
    addr1,
    addr2,
  };
}

describe("SuperchainPointsRaffle", function () {
  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { superchainPointsRaffle, owner } = await loadFixture(
        deploySuperchainPointsRaffleFixture
      );
      expect(await superchainPointsRaffle.owner()).to.equal(owner.address);
    });
  });

  describe("Contract", function () {
    it("Initialize should pull points for prize", async function () {
      const { superchainPoints, superchainPointsRaffle, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      // mint points for owner
      await superchainPoints.connect(owner).mint(owner.address, 100);
      await superchainPoints
        .connect(owner)
        .approve(await superchainPointsRaffle.getAddress(), 100);

      const prize = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const balanceBefore = await superchainPoints.balanceOf(owner.address);

      //  initialize raffle
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            ethers.encodeBytes32String("demo"),
            prize,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;

      const balanceAfter = await superchainPoints.balanceOf(owner.address);
      expect(balanceBefore - balanceAfter).to.equal(prize);
    });

    it("Should draw a winner", async function () {});

    it("Should validate seed", async function () {});

    it("Should transfer points to winner", async function () {});

    it("Should enforce badge requirement", async function () {});
  });
});
