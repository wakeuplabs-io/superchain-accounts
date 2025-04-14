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

  const SuperchainPointsRaffle = await ethers.getContractFactory(
    "SuperchainPointsRaffle"
  );
  const superchainPointsRaffle = await SuperchainPointsRaffle.deploy(
    owner.address,
    await superchainPoints.getAddress(),
    await superchainBadges.getAddress()
  );

  // mint points for owner
  await superchainPoints.connect(owner).mint(owner.address, 1_000_000_000n);
  await superchainPoints
    .connect(owner)
    .approve(await superchainPointsRaffle.getAddress(), ethers.MaxUint256);

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

  describe("Raffle", function () {
    it("Initialize should pull points for jackpot", async function () {
      const { superchainPoints, superchainPointsRaffle, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      const jackpot = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const balanceBefore = await superchainPoints.balanceOf(owner.address);
      const revealAfter = await time.latest() + 24 * 60 * 60;

      //  initialize raffle
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(ethers.encodeBytes32String("demo"), owner.address),
            revealAfter,
            jackpot,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;

      const balanceAfter = await superchainPoints.balanceOf(owner.address);
      expect(balanceBefore - balanceAfter).to.equal(jackpot);
    });

    it("Should select a winner from participants and transfer points", async function () {
      const {
        superchainPointsRaffle,
        superchainPoints,
        superchainBadges,
        owner,
        addr1,
        addr2,
      } = await loadFixture(deploySuperchainPointsRaffleFixture);

      const jackpot = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const revealAfter = await time.latest() + 24 * 60 * 60;

      //  initialize raffle
      const seed = ethers.encodeBytes32String("demo");
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            revealAfter,
            jackpot,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;

      // add participants
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();
      await superchainBadges.connect(owner).mint(addr2.address, 2n);
      await superchainPointsRaffle.connect(addr2).claimTickets();

      // select winner
      await time.increaseTo(revealAfter);
      await expect(
        superchainPointsRaffle.connect(owner).revealWinner(seed)
      ).to.emit(superchainPointsRaffle, "RaffleWinner");

      // check winner balance
      const winner = await superchainPointsRaffle.getWinner();
      expect(await superchainPoints.balanceOf(winner)).to.equal(jackpot);
    });

    it("Only owner can initialize raffle", async function () {
      const { superchainPointsRaffle, owner, addr1 } = await loadFixture(
        deploySuperchainPointsRaffleFixture
      );

      const jackpot = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const seed = ethers.encodeBytes32String("demo");
      const revealAfter = await time.latest() + 24 * 60 * 60;

      //  initialize raffle addr1
      await expect(
        superchainPointsRaffle
          .connect(addr1)
          .initialize(
            sealSeed(seed, addr1.address),
            revealAfter,
            jackpot,
            badges,
            badgesAllocations
          )
      ).to.be.reverted;

      // initialize raffle owner
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            revealAfter,
            jackpot,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;
    });

    it("Only owner can reveal raffle", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      const jackpot = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const seed = ethers.encodeBytes32String("demo");
      const revealAfter = await time.latest() + 24 * 60 * 60;

      // initialize raffle owner
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            revealAfter,
            jackpot,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;

      // add participants so it doesn't revert on winner being zero address
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();
      await time.increaseTo(revealAfter);

      // reveal raffle addr1
      await expect(superchainPointsRaffle.connect(addr1).revealWinner(seed)).to
        .be.reverted;

      // reveal raffle owner
      await expect(superchainPointsRaffle.connect(owner).revealWinner(seed)).not
        .to.be.reverted;
    });

    it("Only owner can reveal raffle after specified time", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      const jackpot = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const seed = ethers.encodeBytes32String("demo");

      const now = Math.floor(Date.now() / 1000);
      const revealAfter = now + 24 * 60 * 60; // + 1 day

      // initialize raffle owner
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            revealAfter,
            jackpot,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;

      // add participants so it doesn't revert on winner being zero address
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();

      // reveal raffle addr1
      await expect(
        superchainPointsRaffle.connect(owner).revealWinner(seed)
      ).to.be.revertedWithCustomError(
        superchainPointsRaffle,
        "CannotRevealBeforeTimestamp"
      );
      
      // reveal raffle owner
      await time.increaseTo(revealAfter);
      await expect(superchainPointsRaffle.connect(owner).revealWinner(seed)).not
        .to.be.reverted;
    });

    it("Should assign points based on badge", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1, addr2 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      const jackpot = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const seed = ethers.encodeBytes32String("demo");
      const revealAfter = await time.latest() + 24 * 60 * 60;

      //  initialize raffle
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            revealAfter,
            jackpot,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;

      // addr1 has badge 1n so should receive 10 points
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await expect(superchainPointsRaffle.connect(addr1).claimTickets())
        .to.emit(superchainPointsRaffle, "TicketsClaimed")
        .withArgs(addr1.address, 10n);

      // addr2 has badge 2n so should receive 100 points
      await superchainBadges.connect(owner).mint(addr2.address, 2n);
      await expect(superchainPointsRaffle.connect(addr2).claimTickets())
        .to.emit(superchainPointsRaffle, "TicketsClaimed")
        .withArgs(addr2.address, 100n);
    });

    it("If new badge acquired, can claim newly earned tickets", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1, addr2 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      const jackpot = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const seed = ethers.encodeBytes32String("demo");
      const revealAfter = await time.latest() + 24 * 60 * 60;

      //  initialize raffle
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            revealAfter,
            jackpot,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;

      // addr1 has badge 1n so should receive 10 points
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      expect(
        await superchainPointsRaffle.getClaimableTickets(addr1.address)
      ).to.equal(10n);
      await expect(superchainPointsRaffle.connect(addr1).claimTickets())
        .to.emit(superchainPointsRaffle, "TicketsClaimed")
        .withArgs(addr1.address, 10n);
      expect(
        await superchainPointsRaffle.getClaimableTickets(addr1.address)
      ).to.equal(0n);

      // addr1 has new badge 2n so should receive 90 extra points to fill the 100n he deserves
      await superchainBadges.connect(owner).mint(addr1.address, 2n);
      expect(
        await superchainPointsRaffle.getClaimableTickets(addr1.address)
      ).to.equal(90n);
      await expect(superchainPointsRaffle.connect(addr1).claimTickets())
        .to.emit(superchainPointsRaffle, "TicketsClaimed")
        .withArgs(addr1.address, 90n);
      expect(
        await superchainPointsRaffle.getClaimableTickets(addr1.address)
      ).to.equal(0n);

      // no more claiming
      await expect(superchainPointsRaffle.connect(addr1).claimTickets()).to.be
        .reverted;
    });
  });

  describe("Randomness", function () {
    it("Should validate seed", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      // initialize
      const seed = ethers.encodeBytes32String("demo");
      const revealAfter = await time.latest() + 24 * 60 * 60;
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            revealAfter,
            10n,
            [1n, 2n],
            [10n, 100n]
          )
      ).not.to.be.reverted;

      // add at least one participant so reveal doesn't revert on winner == zero address
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();
      await time.increaseTo(revealAfter);

      // validate seed
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .revealWinner(ethers.encodeBytes32String("other"))
      ).to.be.revertedWithCustomError(superchainPointsRaffle, "InvalidSeed");

      await expect(superchainPointsRaffle.connect(owner).revealWinner(seed)).not
        .to.be.reverted;
    });

    it("Seed is attached to user that initialized", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      // initialize
      const seed = ethers.encodeBytes32String("demo");
      const revealAfter = await time.latest() + 24 * 60 * 60;
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            revealAfter,
            10n,
            [1n, 2n],
            [10n, 100n]
          )
      ).not.to.be.reverted;

      // add at least one participant so reveal doesn't revert on winner == zero address
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();

      // transfer ownership
      await superchainPointsRaffle
        .connect(owner)
        .transferOwnership(addr1.address);

      // validate seed. Addr1 is owner but didn't send seed so cannot reveal
      await time.increaseTo(revealAfter);
      await expect(
        superchainPointsRaffle.connect(addr1).revealWinner(seed)
      ).to.be.revertedWithCustomError(superchainPointsRaffle, "InvalidSeed");
    });
  });
});

function sealSeed(seed: string, owner: string) {
  return ethers.keccak256(
    ethers.solidityPacked(["address", "bytes32"], [owner, seed])
  );
}
