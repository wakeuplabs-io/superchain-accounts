// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

interface ISuperchainBadgesErrors {
    /// @dev Account can hold only one badge
    error BadgeAlreadyClaimed(address, uint256);

    /// @dev Error thrown when the badge is not eligible
    error NotEligible(uint256);

    /// @dev Badges are non-transferable
    error SoulBoundNonTransferable();
}

interface ISuperchainBadgesEvents {
    /// @notice Emitted when the badge is claimed
    event Claimed(address, uint256);

    /// @notice Emitted when the badge is set as claimable
    event Claimable(address, uint256);
}

interface ISuperchainBadges is
    IERC1155,
    IERC1155MetadataURI,
    ISuperchainBadgesErrors,
    ISuperchainBadgesEvents
{
    /// @notice Sets the badge as eligible
    /// @param allocations The accounts that are eligible for the badge
    /// @param tokenIds The badge to set as eligible
    function addClaimable(
        address[] memory allocations,
        uint256[] memory tokenIds
    ) external;

    /// @notice Returns all badges user is eligible for
    /// @param account The account to check
    function getClaimable(
        address account
    ) external view returns (uint256[] memory);

    /// @notice Claims the badge
    /// @param tokenId The badge to claim
    function claim(uint256 tokenId) external;
}
