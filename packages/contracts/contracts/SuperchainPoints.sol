// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {ISuperchainPoints} from "./interfaces/ISuperchainPoints.sol";
import {IERC7802, IERC165} from "./interfaces/IERC7802.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {PredeployAddresses} from "./libraries/SuperchainPredeployAddresses.sol";

/// @title SuperchainPoints
/// @notice A standard ERC20 extension implementing IERC7802 for unified cross-chain fungibility across
///         the Superchain. Allows the SuperchainTokenBridge to mint and burn tokens as needed.
contract SuperchainPoints is ISuperchainPoints, ERC20, Ownable {
    mapping(address => uint256) public claimable;
    mapping(address => uint256) public claimed;

    constructor(
        address owner,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(owner) {}

    /// @inheritdoc ISuperchainPoints
    function addClaimable(
        address[] calldata users,
        uint256[] calldata amounts
    ) external onlyOwner {
        if (users.length != amounts.length) {
            revert LengthMismatch();
        }

        for (uint256 i = 0; i < users.length; i++) {
            claimable[users[i]] += amounts[i];
            emit TokensAdded(users[i], amounts[i]);
        }
    }

    /// @inheritdoc ISuperchainPoints
    function getClaimable(address user) external view returns (uint256) {
        return claimable[user] - claimed[user];
    }

    /// @inheritdoc ISuperchainPoints
    function claim() external {
        uint256 total = claimable[msg.sender];
        uint256 alreadyClaimed = claimed[msg.sender];
        if (total <= alreadyClaimed) {
            revert NothingToClaim();
        }

        uint256 amountToClaim = total - alreadyClaimed;
        claimed[msg.sender] = total;

        _mint(msg.sender, amountToClaim);

        emit TokensClaimed(msg.sender, amountToClaim);
    }

    /// @notice Allows owner to mint tokens
    /// @param to address that receives the tokens
    /// @param amount token amount
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @inheritdoc IERC7802
    function crosschainMint(address _to, uint256 _amount) external {
        if (msg.sender == PredeployAddresses.SUPERCHAIN_TOKEN_BRIDGE) {
            revert Unauthorized();
        }

        _mint(_to, _amount);

        emit CrosschainMint(_to, _amount, msg.sender);
    }

    /// @inheritdoc IERC7802
    function crosschainBurn(address _from, uint256 _amount) external {
        if (msg.sender == PredeployAddresses.SUPERCHAIN_TOKEN_BRIDGE) {
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
