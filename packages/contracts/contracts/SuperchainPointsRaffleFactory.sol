// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/interfaces/IERC1155.sol";
import {Proxy} from "@openzeppelin/contracts/proxy/Proxy.sol";
import {ISuperchainPointsRaffle} from "./interfaces/ISuperchainPointsRaffle.sol";
import {SuperchainPointsRaffle} from "./SuperchainPointsRaffle.sol";

/// @title SuperchainPointsRaffleFactory
/// @notice Factory for SuperchainPointsRaffle contracts that also acts as a proxy for the current raffle
contract SuperchainPointsRaffleFactory is Ownable {
    IERC20 public superchainPoints;
    IERC1155 public superchainBadges;

    ISuperchainPointsRaffle public currentRaffle;

    /// @param _initialOwner The initial owner of the contract
    /// @param _superchainPoints The address of the SuperchainPoints contract
    /// @param _superchainBadges The address of the SuperchainBadges contract
    constructor(
        address _initialOwner,
        IERC20 _superchainPoints,
        IERC1155 _superchainBadges
    ) Ownable(_initialOwner) {
        superchainPoints = _superchainPoints;
        superchainBadges = _superchainBadges;
    }

    function createRaffle() public onlyOwner {
        if (address(currentRaffle) != address(0) && currentRaffle.isFinished() == false) {
            revert("Ongoing raffle");
        }

        currentRaffle = new SuperchainPointsRaffle(
            owner(),
            superchainPoints,
            superchainBadges
        );
    }

}
