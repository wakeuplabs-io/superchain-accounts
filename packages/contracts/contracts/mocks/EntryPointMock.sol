// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.29;

import {EntryPoint} from "@account-abstraction/contracts/core/EntryPoint.sol";
import {IPaymaster} from "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {SIG_VALIDATION_FAILED, SIG_VALIDATION_SUCCESS} from "@account-abstraction/contracts/core/Helpers.sol";

contract EntryPointMock is EntryPoint {
    
    /// @notice This function is used for testing the Paymaster function `validatePaymasterUserOp` as it should be called from the Entrypoint only
    function testValidatePaymasterOp(
        address paymasterAddress,
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) public returns (bytes memory context, uint256 validationData) {
        (context, validationData) = IPaymaster(paymasterAddress)
            .validatePaymasterUserOp(userOp, userOpHash, maxCost);

        if (validationData == SIG_VALIDATION_FAILED) {
            revert("SIG_VALIDATION_FAILED");
        }

        return (context, validationData);
    }
}
