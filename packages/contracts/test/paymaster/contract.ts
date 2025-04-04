import { expect } from "chai";
import { getAddress } from "viem";
import { generateTestEnv, TestEnv } from "../shared/helpers/deploy";
import { ZERO_ADDRESS } from "../shared/constants";

// TODO: skip as it should use hardhat network OSA-63
describe.skip("WakeUpPaymaster", () => {
  let testEnv: TestEnv;

  beforeEach(async () => {
    testEnv = await generateTestEnv();
  });

  describe("Set Up", () => {
    it("should deploy the WakeUpPaymaster contract", async () => {
      expect(testEnv.paymaster).not.to.be.undefined;
    });

    it("should set the correct owner", async () => {
      const ownerAddress = await testEnv.paymasterService.getOwner();
      expect(ownerAddress).to.equal(
        getAddress(testEnv.clients.owner.account.address)
      );
    });
  });

  describe("Account Management", () => {
    it("should allow the owner to add an account", async () => {
      // Add account
      await testEnv.paymasterService.allowAccount(
        testEnv.clients.investorOne.account.address
      );
      // Check if account was added by asking the contract if the account is allowed
      const isAccountAdded = await testEnv.paymasterService.isAccountAllowed(
        testEnv.clients.investorOne.account.address
      );
      expect(isAccountAdded).to.be.true;
    });

    it("should revert when an not ownerAddress tries to add an account", async () => {
      await expect(
        testEnv.paymasterService.allowAccount(
          testEnv.clients.investorOne.account.address,
          testEnv.clients.investorOne
        )
      ).to.be.revertedWith(/OwnableUnauthorizedAccount/);
    });

    it("should revert when an not ownerAddress tries to check if account is allowed", async () => {
      await expect(
        testEnv.paymasterService.isAccountAllowed(
          testEnv.clients.investorOne.account.address,
          testEnv.clients.investorOne
        )
      ).to.be.revertedWith(/OwnableUnauthorizedAccount/);
    });

    it("should allow the owner to remove an account", async () => {
      // Add an account
      await testEnv.paymasterService.allowAccount(
        testEnv.clients.investorOne.account.address
      );

      //validate account was added
      const isAccountAdded = await testEnv.paymasterService.isAccountAllowed(
        testEnv.clients.investorOne.account.address
      );
      expect(isAccountAdded).to.be.true;

      //Remove the account
      await testEnv.paymasterService.removeAccount(
        testEnv.clients.investorOne.account.address
      );

      // Check if account was removed by asking the contract if the account is allowed
      const isAccountRemoved = await testEnv.paymasterService.isAccountAllowed(
        testEnv.clients.investorOne.account.address
      );
      expect(isAccountRemoved).to.be.false;
    });

    it("should revert when an not ownerAddress tries to remove an account", async () => {
      await expect(
        testEnv.paymasterService.removeAccount(
          testEnv.clients.investorOne.account.address,
          testEnv.clients.investorOne
        )
      ).to.be.revertedWith(/OwnableUnauthorizedAccount/);
    });
  });

  describe("Validate Paymaster User OP", () => {
    it("should revert when the paymaster user op has no sender", async () => {
      const userOp = testEnv.paymasterService.buildUserOperation({
        sender: ZERO_ADDRESS,
      });
      await expect(
        testEnv.paymasterService.validatePaymasterUserOp(userOp)
      ).to.be.revertedWith(/senderNotProvided/);
    });

    it("should revert when the sender is not allowed", async () => {
      const userOp = testEnv.paymasterService.buildUserOperation({
        sender: testEnv.clients.investorOne.account.address,
      });

      await expect(
        testEnv.paymasterService.validatePaymasterUserOp(userOp)
      ).to.be.revertedWith(/SIG_VALIDATION_FAILED/);
    });

    it("should sponsor gas when the sender is allowed", async () => {
      const userOp = testEnv.paymasterService.buildUserOperation({
        sender: testEnv.clients.investorOne.account.address,
      });

      //allow the account
      await testEnv.paymasterService.allowAccount(
        testEnv.clients.investorOne.account.address
      );

      //run validation
      const result = await testEnv.paymasterService.validatePaymasterUserOp(
        userOp
      );
      expect(result.status).to.equal("success");
    });

    it("should revert when the sender is removed from allowed accounts", async () => {
      const userOp = testEnv.paymasterService.buildUserOperation({
        sender: testEnv.clients.investorOne.account.address,
      });

      //allow the account
      await testEnv.paymasterService.allowAccount(
        testEnv.clients.investorOne.account.address
      );

      //run validation
      const result = await testEnv.paymasterService.validatePaymasterUserOp(
        userOp
      );
      expect(result.status).to.equal("success");

      //Remove the account
      await testEnv.paymasterService.removeAccount(
        testEnv.clients.investorOne.account.address
      );

      await expect(
        testEnv.paymasterService.validatePaymasterUserOp(userOp)
      ).to.be.revertedWith(/SIG_VALIDATION_FAILED/);
    });
  });
});
