// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IWakeUpPaymaster {
    /**
     * @notice Adds a new account to the paymaster allowed accounts.
     * @notice Only the owner can call this function.
     * @param account The address of the account to add.
     * @dev This function is used to add new accounts to the paymaster allowed accounts.
     **/
    function addAccount(address account) external;

    /**
     * @notice Removes an account from the paymaster allowed accounts.
     * @notice Only the owner can call this function.
     * @param account The address of the account to remove.
     * @dev This function is used to remove accounts from the paymaster allowed accounts.
     **/
    function removeAccount(address account) external;

    /**
     * @notice Checks if an account is allowed by the paymaster.
     * @param account The address of the account to check.
     * @return A boolean indicating whether the account is allowed.
     * @dev This function is used to check if an account is allowed by the paymaster.
     * @dev Only owner can call this function.
     **/
    function isAccountAllowed(address account) external view returns (bool);
}
