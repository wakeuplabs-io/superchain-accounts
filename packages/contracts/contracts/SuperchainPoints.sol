// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IERC7802, IERC165} from "./interfaces/IERC7802.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {PredeployAddresses} from "./libraries/SuperchainPredeployAddresses.sol";

/// @title SuperchainPoints
/// @notice A standard ERC20 extension implementing IERC7802 for unified cross-chain fungibility across
///         the Superchain. Allows the SuperchainTokenBridge to mint and burn tokens as needed.
contract SuperchainPoints is ERC20, IERC7802, Ownable {
    /// @dev Unauthorized error
    error Unauthorized();

    constructor(
        address owner,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(owner) {}

    /// @notice Allows owner to mint tokens
    /// @param to address that receives the tokens
    /// @param amount token amount
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Allows owner to mint a batch of tokens
    /// @param to array of addresses that receives the tokens
    /// @param amount array of token amounts
    function batchMint(
        address[] memory to,
        uint256[] memory amount
    ) external onlyOwner {
        for (uint256 i = 0; i < to.length; i++) {
            _mint(to[i], amount[i]);
        }
    }

    /// @notice Allows the SuperchainTokenBridge to mint tokens.
    /// @param _to     Address to mint tokens to.
    /// @param _amount Amount of tokens to mint.
    function crosschainMint(address _to, uint256 _amount) external {
        if (msg.sender != PredeployAddresses.SUPERCHAIN_TOKEN_BRIDGE) {
            revert Unauthorized();
        }

        _mint(_to, _amount);

        emit CrosschainMint(_to, _amount, msg.sender);
    }

    /// @notice Allows the SuperchainTokenBridge to burn tokens.
    /// @param _from   Address to burn tokens from.
    /// @param _amount Amount of tokens to burn.
    function crosschainBurn(address _from, uint256 _amount) external {
        if (msg.sender != PredeployAddresses.SUPERCHAIN_TOKEN_BRIDGE) {
            revert Unauthorized();
        }
        
        _burn(_from, _amount);

        emit CrosschainBurn(_from, _amount, msg.sender);
    }

    /// @inheritdoc IERC165
    function supportsInterface(
        bytes4 _interfaceId
    ) public view virtual returns (bool) {
        return
            _interfaceId == type(IERC7802).interfaceId ||
            _interfaceId == type(IERC20).interfaceId ||
            _interfaceId == type(IERC165).interfaceId;
    }
}
