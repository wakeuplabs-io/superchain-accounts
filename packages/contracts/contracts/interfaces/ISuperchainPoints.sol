// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC7802} from "./IERC7802.sol";

interface ISuperchainPointsErrors {
    /// @dev Unauthorized error
    error Unauthorized();

    /// @dev Nothing to claim
    error NothingToClaim();

    /// @dev Length mismatch
    error LengthMismatch();
}

interface ISuperchainPointsEvents {
    /// @notice Emitted when tokens are added to be claimable by users.
    /// @param account The account that added the tokens
    /// @param amount The amount of tokens added
    event TokensAdded(address account, uint256 amount);

    /// @notice Emitted when tokens are claimed
    /// @param account The account that claimed the tokens
    /// @param amount The amount of tokens claimed
    event TokensClaimed(address account, uint256 amount);
}

interface ISuperchainPoints is
    IERC20,
    IERC7802,
    ISuperchainPointsErrors,
    ISuperchainPointsEvents
{
    /// @notice Owner adds tokens to be claimable by users.
    /// @param users Array of user addresses.
    /// @param amounts Array of claimable amounts (added to existing claimable).
    function addClaimable(
        address[] calldata users,
        uint256[] calldata amounts
    ) external;

    /// @notice View how much a user can still claim
    /// @param account The account to check
    function claimableAmount(address account) external view returns (uint256);

    /// @notice Claim the tokens assigned to the caller.
    function claim() external;
}
