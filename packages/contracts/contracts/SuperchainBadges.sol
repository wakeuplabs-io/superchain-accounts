// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISuperchainBadges} from "./interfaces/ISuperchainBadges.sol";
import {ERC1155, IERC1155, IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/// @title SuperchainBadges
/// @notice Badges for Superchain Achievements. Badges are non-transferable and claimable.
contract SuperchainBadges is ISuperchainBadges, ERC1155, Ownable {
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => mapping(uint256 => bool)) internal claimed;
    mapping(address => mapping(uint256 => bool)) internal claimable;
    mapping(address => uint256[]) internal claimableList;

    /// @param initialOwner address of the initial owner
    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    /// @inheritdoc ISuperchainBadges
    function addClaimable(
        address[] memory allocations,
        uint256[] memory tokenIds
    ) public onlyOwner {
        for (uint256 i = 0; i < allocations.length; i++) {
            if (claimable[allocations[i]][tokenIds[i]] == true) {
                continue;
            }

            claimable[allocations[i]][tokenIds[i]] = true;
            claimableList[allocations[i]].push(tokenIds[i]);

            emit Claimable(allocations[i], tokenIds[i]);
        }
    }

    /// @inheritdoc ISuperchainBadges
    function getClaimable(
        address account
    ) public view returns (uint256[] memory) {
        return claimableList[account];
    }

    /// @inheritdoc ISuperchainBadges
    function claim(uint256 tokenId) public {
        if (
            claimable[msg.sender][tokenId] == false &&
            claimed[msg.sender][tokenId] == false
        ) {
            revert NotEligible(tokenId);
        }

        // mark as claimed and remove from array
        claimed[msg.sender][tokenId] = true;
        uint256[] storage list = claimableList[msg.sender];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == tokenId) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }

        _mint(msg.sender, tokenId, 1, "");

        emit Claimed(msg.sender, tokenId);
    }

    /// @inheritdoc IERC1155MetadataURI
    function uri(
        uint256 tokenId
    )
        public
        view
        override(ERC1155, IERC1155MetadataURI)
        returns (string memory)
    {
        return _tokenURIs[tokenId];
    }

    /// @notice Sets the token URI
    function setURI(uint256 tokenId, string memory newUri) public onlyOwner {
        _tokenURIs[tokenId] = newUri;

        emit URI(newUri, tokenId);
    }

    /// @notice Mints a badge
    function mint(address account, uint256 id) public onlyOwner {
        // verify account doesn't have it already
        if (balanceOf(account, id) == 1) {
            revert BadgeAlreadyClaimed(account, id);
        }

        _mint(account, id, 1, "");
    }

    /// @dev Override to block transfers
    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure override(ERC1155, IERC1155) {
        revert SoulBoundNonTransferable();
    }

    /// @dev Override to block transfers
    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure override(ERC1155, IERC1155) {
        revert SoulBoundNonTransferable();
    }
}
