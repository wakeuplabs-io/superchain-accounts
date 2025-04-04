// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155MetadataURI}  from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

interface ISuperchainBadgesErrors {
    /// @dev Account can hold only one badge
    error BadgeAlreadyClaimed(address, uint256);

    /// @dev Error thrown when the badge is not eligible
    error NotEligible(uint256);

    /// @dev Badges are non-transferable
    error SoulBoundNonTransferable();
}

interface ISuperchainBadgesEvents {
    event Claimed(address, uint256);
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
    function setIsEligible(
        address[] memory allocations,
        uint256[] memory tokenIds
    ) external;

    /// @notice Returns true if the user is eligible for the badge
    /// @param account The account to check
    /// @param tokenId The badge to check
    function isEligible(
        address account,
        uint256 tokenId
    ) external view returns (bool);

    /// @notice Claims the badge
    /// @param tokenId The badge to claim
    function claim(uint256 tokenId) external;
}
