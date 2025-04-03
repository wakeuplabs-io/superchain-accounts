// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract SuperchainBadge is ERC1155, Ownable, ERC1155Supply {
    /// @dev Token id to URI
    mapping(uint256 => string) private _tokenURIs;

    /// @dev Account can hold only one badge
    error AccountAlreadyHasThisBadge(address, uint256);

    /// @dev Constructor
    /// @param initialOwner address of the initial owner
    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    /// @notice Mints a single token
    /// @param account address that receives the token
    /// @param id token id
    function mint(address account, uint256 id) public onlyOwner {
        // verify account doesn't have it already
        if (balanceOf(account, id) == 0) {
            revert AccountAlreadyHasThisBadge(account, id);
        }

        _mint(account, id, 1, "");
    }

    /// @notice Mints a batch of tokens
    /// @param to array of addresses that receives the tokens
    /// @param ids array of token ids (matching the length of the to array)
    function mintBatch(
        address[] memory to,
        uint256[] memory ids
    ) public onlyOwner {
        for (uint i = 0; i < ids.length; i++) {
            mint(to[i], ids[i]);
        }
    }

    /// @dev openzeppelin by default returns same uri for all. We override this.
    /// @param tokenId token id
    /// @param newUri new uri for token id
    function setURI(uint256 tokenId, string memory newUri) public onlyOwner {
        _tokenURIs[tokenId] = newUri;

        emit URI(newUri, tokenId);
    }

    /// @dev openzeppelin by default returns same uri for all. We override this.
    /// @param tokenId token id
    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    /// @dev required by ERC1155Supply to track supply
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
