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
    it("Initialize should pull points for prize", async function () {
      const { superchainPoints, superchainPointsRaffle, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

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

    it("Should select a winner from participants and transfer points", async function () {
      const {
        superchainPointsRaffle,
        superchainPoints,
        superchainBadges,
        owner,
        addr1,
        addr2,
      } = await loadFixture(deploySuperchainPointsRaffleFixture);

      const prize = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      
      //  initialize raffle
      const seed = ethers.encodeBytes32String("demo");
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            prize,
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
      await expect(superchainPointsRaffle.connect(owner).revealWinner(seed)).to.emit(
        superchainPointsRaffle,
        "RaffleWinner"
      );

      // check winner balance
      const winner = await superchainPointsRaffle.winners(1);
      expect(await superchainPoints.balanceOf(winner)).to.equal(prize);
    });

    it("Only owner can initialize raffle", async function () {
      const { superchainPointsRaffle, owner, addr1 } = await loadFixture(
        deploySuperchainPointsRaffleFixture
      );

      const prize = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const seed = ethers.encodeBytes32String("demo");

      //  initialize raffle addr1
      await expect(
        superchainPointsRaffle
          .connect(addr1)
          .initialize(
            sealSeed(seed, addr1.address),
            prize,
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
            prize,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;
    });

    it("Only owner can reveal raffle", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      const prize = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const seed = ethers.encodeBytes32String("demo");

      // initialize raffle owner
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            prize,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;

      // add participants so it doesn't revert on winner being zero address
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();

      // reveal raffle addr1
      await expect(superchainPointsRaffle.connect(addr1).revealWinner(seed)).to.be
        .reverted;

      // reveal raffle owner
      await expect(superchainPointsRaffle.connect(owner).revealWinner(seed)).not.to.be
        .reverted;
    });

    it("Should assign points based on badge", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1, addr2 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      const prize = 10n;
      const badges = [1n, 2n];
      const badgesAllocations = [10n, 100n];
      const seed = ethers.encodeBytes32String("demo");

      //  initialize raffle
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(seed, owner.address),
            prize,
            badges,
            badgesAllocations
          )
      ).not.to.be.reverted;

      // addr1 has badge 1n so should receive 10 points
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await expect(superchainPointsRaffle.connect(addr1).claimTickets())
        .to.emit(superchainPointsRaffle, "TicketsClaimed")
        .withArgs(1, addr1.address, 10n);

      // addr2 has badge 2n so should receive 100 points
      await superchainBadges.connect(owner).mint(addr2.address, 2n);
      await expect(superchainPointsRaffle.connect(addr2).claimTickets())
        .to.emit(superchainPointsRaffle, "TicketsClaimed")
        .withArgs(1, addr2.address, 100n);
    });

    it("Can be reinitialized once finished", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      // initialize raffle a first time
      const firstSeed = ethers.encodeBytes32String("demo");
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(firstSeed, owner.address),
            10n,
            [1n, 2n],
            [10n, 100n]
          )
      ).not.to.be.reverted;

      // add participants so it doesn't revert on winner being zero address
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();

      // reveal raffle owner
      await expect(superchainPointsRaffle.connect(owner).revealWinner(firstSeed)).not
        .to.be.reverted;

      // reinitialize raffle
      const secondSeed = ethers.encodeBytes32String("second-demo");
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(secondSeed, owner.address),
            10n,
            [10n, 2n],
            [1000n, 500n]
          )
      ).not.to.be.reverted;

      // tickets balance should be zero
      expect(await superchainPointsRaffle.tickets(addr1.address)).to.equal(0n);

      // badges requirement should be updated
      expect(await superchainPointsRaffle.getEligibleBadges()).to.deep.equal([
        10n,
        2n,
      ]);

      // badges allocation should be updated
      expect(await superchainPointsRaffle.badgeAllocations(2n)).to.equal(500n);
    });

    it("Cannot be reinitialized if already started", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      // initialize raffle a first time
      const seed = ethers.encodeBytes32String("demo");
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(sealSeed(seed, owner.address), 10n, [1n, 2n], [10n, 100n])
      ).not.to.be.reverted;

      // reinitialize raffle
      const secondSeed = ethers.encodeBytes32String("second-demo");
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(secondSeed, owner.address),
            10n,
            [10n, 2n],
            [1000n, 500n]
          )
      ).to.be.revertedWithCustomError(
        superchainPointsRaffle,
        "RaffleAlreadyStarted"
      );
    });

    it("Cannot be reinitialized with the same seed", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      // initialize raffle a first time
      const firstSeed = ethers.encodeBytes32String("demo");
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(firstSeed, owner.address),
            10n,
            [1n, 2n],
            [10n, 100n]
          )
      ).not.to.be.reverted;

      // add participants so it doesn't revert on winner being zero address
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();

      // reveal raffle owner
      await expect(superchainPointsRaffle.connect(owner).revealWinner(firstSeed)).not
        .to.be.reverted;

      // reinitialize raffle
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(
            sealSeed(firstSeed, owner.address),
            10n,
            [10n, 2n],
            [1000n, 500n]
          )
      ).to.be.revertedWithCustomError(
        superchainPointsRaffle,
        "SeedAlreadyUsed"
      );
    });
  });

  describe("Randomness", function () {
    it("Should validate seed", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      // initialize
      const seed = ethers.encodeBytes32String("demo");
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(sealSeed(seed, owner.address), 10n, [1n, 2n], [10n, 100n])
      ).not.to.be.reverted;

      // add at least one participant so reveal doesn't revert on winner == zero address
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();

      // validate seed
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .revealWinner(ethers.encodeBytes32String("other"))
      ).to.be.revertedWithCustomError(superchainPointsRaffle, "InvalidSeed");

      await expect(superchainPointsRaffle.connect(owner).revealWinner(seed)).not.to.be
        .reverted;
    });

    it("Seed is attached to user that initialized", async function () {
      const { superchainPointsRaffle, superchainBadges, owner, addr1 } =
        await loadFixture(deploySuperchainPointsRaffleFixture);

      // initialize
      const seed = ethers.encodeBytes32String("demo");
      await expect(
        superchainPointsRaffle
          .connect(owner)
          .initialize(sealSeed(seed, owner.address), 10n, [1n, 2n], [10n, 100n])
      ).not.to.be.reverted;

      // add at least one participant so reveal doesn't revert on winner == zero address
      await superchainBadges.connect(owner).mint(addr1.address, 1n);
      await superchainPointsRaffle.connect(addr1).claimTickets();

      // transfer ownership
      await superchainPointsRaffle
        .connect(owner)
        .transferOwnership(addr1.address);

      // validate seed. Addr1 is owner but didn't send seed so cannot reveal
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
