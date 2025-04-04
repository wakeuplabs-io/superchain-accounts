// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.29;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/samples/SimpleAccountFactory.sol";
import {BasePaymaster} from "@account-abstraction/contracts/core/BasePaymaster.sol";
import {IEntryPoint} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {SIG_VALIDATION_FAILED, SIG_VALIDATION_SUCCESS} from "@account-abstraction/contracts/core/Helpers.sol";
import {PackedUserOperation} from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import {IWakeUpPaymaster} from "./interfaces/IPaymaster.sol";


/// @notice ERC-4337 Paymaster implementation that is in charge of sponsoring smart accounts operations gas.
/// In order to allow an operation to be sponsored, the smart account must be registered in the paymaster.
contract WakeUpPaymaster is IWakeUpPaymaster, BasePaymaster {
    mapping(address => bool) private allowedAccounts;

    constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) {}

    /// @inheritdoc IWakeUpPaymaster
    function allowAccount(address account) external onlyOwner {
        allowedAccounts[account] = true;
    }

    /// @inheritdoc IWakeUpPaymaster
    function removeAccount(address account) external onlyOwner {
        delete allowedAccounts[account];
    }

    /// @inheritdoc IWakeUpPaymaster
    function isAccountAllowed(
        address account
    ) public view onlyOwner returns (bool) {
        return _isAccountAllowed(account);
    }

    /// @dev Validate if sponsorship for the given operation sender is allowed.
    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 /*userOpHash*/,
        uint256 /*maxCost*/
    )
        internal
        view
        override
        returns (bytes memory context, uint256 validationData)
    {
        // validate sender is not zero address
        if (userOp.sender == address(0)) {
            revert senderNotProvided();
        }

        // Deny gas sponsorship if the account is not allowed.
        if (!_isAccountAllowed(userOp.sender)) {
            return (hex"", SIG_VALIDATION_FAILED);
        }

        return (hex"", SIG_VALIDATION_SUCCESS);
    }

    /// @dev Internal function to  validate if the account is allowed to be sponsored.
    /// @param account The account to validate.
    /// @return True if the account is allowed to be sponsored, false otherwise
    function _isAccountAllowed(address account) internal view returns (bool) {
        return allowedAccounts[account];
    }
}
