import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function deploySuperchainBadgesFixture() {
  const [owner, other] = await hre.ethers.getSigners();

  const SuperchainBadges =
    await hre.ethers.getContractFactory("SuperchainBadges");
  const superchainBadges = await SuperchainBadges.deploy(owner);
  const superchainBadgesAddress = await superchainBadges.getAddress();

  return {
    superchainBadges,
    superchainBadgesAddress,
    owner,
    other,
  };
}

describe("SuperchainBadges", function () {
  describe("Deploy", function () {
    it("should deploy and set the correct owner", async function () {
      const { superchainBadges, owner } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      expect(await superchainBadges.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("should allow owner to mint a badge", async function () {
      const { superchainBadges, owner } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      await superchainBadges.connect(owner).mint(owner.address, 1);
      expect(await superchainBadges.balanceOf(owner.address, 1)).to.equal(1);
    });

    it("should prevent minting the same badge twice for the same user", async function () {
      const { superchainBadges, owner: addr1 } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      await superchainBadges.mint(addr1.address, 1);
      await expect(superchainBadges.mint(addr1.address, 1)).to.be.rejected;
    });

    it("should allow batch minting", async function () {
      const {
        superchainBadges,
        owner: addr1,
        other: addr2,
      } = await loadFixture(deploySuperchainBadgesFixture);

      await superchainBadges.mintBatch([addr1.address, addr2.address], [1, 2]);
      expect(await superchainBadges.balanceOf(addr1.address, 1)).to.equal(1);
      expect(await superchainBadges.balanceOf(addr2.address, 2)).to.equal(1);
    });

    it("should allow the owner to set a URI for a token", async function () {
      const { superchainBadges, owner } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      await superchainBadges.connect(owner).setURI(1, "ipfs://new-uri");
      expect(await superchainBadges.uri(1)).to.equal("ipfs://new-uri");
    });

    it("should prevent non-owner from minting", async function () {
      const { superchainBadges, other } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      await expect(superchainBadges.connect(other).mint(other.address, 1)).to.be
        .rejected;
    });
  });

  describe("Claiming", function () {
    it("should allow owner to set eligibility", async function () {
      const { superchainBadges, owner, other } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      await superchainBadges.connect(owner).setIsEligible([other.address], [1]);

      expect(await superchainBadges.isEligible(other.address, 1)).to.equal(
        true
      );
    });

    it("should claim if eligible", async function () {
      const { superchainBadges, owner, other } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      await superchainBadges.connect(owner).setIsEligible([other.address], [1]);

      expect(await superchainBadges.isEligible(other.address, 1)).to.equal(
        true
      );
      expect(await superchainBadges.connect(other).claim(1)).to.not.be.reverted;
    });

    it("should revert if not eligible", async function () {
      const { superchainBadges, other } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      expect(await superchainBadges.isEligible(other.address, 1)).to.equal(
        false
      );
      expect(superchainBadges.connect(other).claim(1)).to.be.rejected;
    });
  });

  describe("URI", function () {
    it("should prevent non-owner from setting URI", async function () {
      const { superchainBadges, other } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      await expect(
        superchainBadges.connect(other).setURI(1, "ipfs://unauthorized")
      ).to.be.rejected;
    });
  });

  describe("Soulbound", function () {
    it("should be non-transferable", async function () {
      const { superchainBadges, owner, other } = await loadFixture(
        deploySuperchainBadgesFixture
      );

      await superchainBadges.connect(owner).mint(owner.address, 1);

      await expect(
        superchainBadges
          .connect(owner)
          .safeTransferFrom(owner.address, other.address, 1, 1, "0x00")
      ).to.be.rejected;
    });
  });
});
