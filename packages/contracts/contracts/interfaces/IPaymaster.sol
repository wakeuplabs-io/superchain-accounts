// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

interface IWakeUpPaymasterErrors {
    ///@notice Error thrown when sender is not provided in User Operation
    error senderNotProvided();
}

interface IWakeUpPaymaster is IWakeUpPaymasterErrors {
    
    /// @notice Allows an account to be gas sponsored.
    /// @notice Only the owner can call this function.
    /// @param account The address of the account to add.
    /// @dev This function is used to add new accounts to the paymaster allowed accounts.
    function allowAccount(address account) external;

    /// @notice Removes an account from the paymaster allowed accounts.
    /// @notice Only the owner can call this function.
    /// @param account The address of the account to remove.
    /// @dev This function is used to remove accounts from the paymaster allowed accounts.
    function removeAccount(address account) external;

    /// @notice Checks if an account is allowed by the paymaster.
    /// @param account The address of the account to check.
    /// @return A boolean indicating whether the account is allowed.
    /// @dev This function is used to check if an account is allowed by the paymaster.
    /// @dev Only owner can call this function.
    function isAccountAllowed(address account) external view returns (bool);
}
