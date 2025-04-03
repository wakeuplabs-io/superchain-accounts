import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

async function deploySuperchainPointsFixture() {
  const [owner, addr1, addr2] = await hre.ethers.getSigners();

  const SuperchainPoints =
    await hre.ethers.getContractFactory("SuperchainPoints");
  const superchainPoints = await SuperchainPoints.deploy(
    owner.address,
    "Superchain Points",
    "SCP"
  );

  return { superchainPoints, owner, addr1, addr2 };
}

describe("SuperchainPoints", function () {
  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { superchainPoints, owner } = await loadFixture(
        deploySuperchainPointsFixture
      );
      expect(await superchainPoints.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const { superchainPoints, owner, addr1 } = await loadFixture(
        deploySuperchainPointsFixture
      );

      await expect(superchainPoints.connect(owner).mint(addr1.address, 100))
        .to.emit(superchainPoints, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, addr1.address, 100);

      expect(await superchainPoints.balanceOf(addr1.address)).to.equal(100);
    });

    it("Should allow owner to batch mint tokens", async function () {
      const { superchainPoints, owner, addr1, addr2 } = await loadFixture(
        deploySuperchainPointsFixture
      );

      await expect(
        superchainPoints
          .connect(owner)
          .batchMint([addr1.address, addr2.address], [100, 200])
      )
        .to.emit(superchainPoints, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, addr1.address, 100)
        .to.emit(superchainPoints, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, addr2.address, 200);

      expect(await superchainPoints.balanceOf(addr1.address)).to.equal(100);
      expect(await superchainPoints.balanceOf(addr2.address)).to.equal(200);
    });

    it("Should fail if non-owner tries to mint", async function () {
      const { superchainPoints, addr1 } = await loadFixture(
        deploySuperchainPointsFixture
      );
      await expect(superchainPoints.connect(addr1).mint(addr1.address, 100)).to
        .be.reverted;
    });
  });
});
