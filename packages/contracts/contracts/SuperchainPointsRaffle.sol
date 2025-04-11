// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/interfaces/IERC1155.sol";
import {ISuperchainPointsRaffle} from "./interfaces/ISuperchainPointsRaffle.sol";

/// @title SuperchainPointsRaffle
/// @notice A raffle contract using https://fravoll.github.io/solidity-patterns/randomness.html pattern for randomness
contract SuperchainPointsRaffle is ISuperchainPointsRaffle, Ownable {
    bool internal initialized = false;

    bytes32 internal sealedSeed;
    uint256 internal storedBlockNumber;
    uint256 internal revealAfterTimestamp;

    IERC20 public superchainPoints;
    IERC1155 public superchainBadges;

    uint256 internal jackpot;
    address internal winner = address(0);

    uint256 internal ticketCount;
    mapping(uint256 => address) internal tickets;
    mapping(address => uint256) internal ticketsClaimed;

    uint256[] internal eligibleBadges;
    mapping(uint256 => uint256) internal badgeAllocations;

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

    /// @inheritdoc ISuperchainPointsRaffle
    function initialize(
        bytes32 _sealedSeed,
        uint256 _revealAfterTimestamp,
        uint256 _jackpot,
        uint256[] memory _badges,
        uint256[] memory _badgeAllocation
    ) public onlyOwner {
        if (initialized) {
            revert RaffleAlreadyStarted();
        }

        // Mark raffle as initialized
        initialized = true;

        // Store seed
        sealedSeed = _sealedSeed;
        storedBlockNumber = block.number + 1;
        revealAfterTimestamp = _revealAfterTimestamp;

        // Store raffle details
        jackpot = _jackpot;

        // Store badge details
        eligibleBadges = new uint256[](_badges.length);
        for (uint256 i = 0; i < _badges.length; i++) {
            badgeAllocations[_badges[i]] = _badgeAllocation[i];
            eligibleBadges[i] = _badges[i];
        }

        // Pull points for prize
        bool success = superchainPoints.transferFrom(
            msg.sender,
            address(this),
            jackpot
        );
        if (!success) {
            revert TransferFailed();
        }

        emit RaffleStarted(sealedSeed, jackpot);
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function revealWinner(bytes32 _seed) public onlyOwner {
        // Verify raffle is ongoing
        if (winner != address(0) || !initialized) {
            revert NoOngoingRaffle();
        }

        // If we reveal in same block we can know block hash
        if (storedBlockNumber > block.number) {
            revert CannotRevealBeforeBlock(storedBlockNumber);
        } else if (revealAfterTimestamp > block.timestamp) {
            revert CannotRevealBeforeTimestamp(revealAfterTimestamp);
        }

        // Prevent owner from changing seed
        if (keccak256(abi.encodePacked(msg.sender, _seed)) != sealedSeed) {
            revert InvalidSeed();
        }

        // Select winner from ticket pool
        uint256 random = uint256(
            keccak256(abi.encodePacked(_seed, blockhash(storedBlockNumber)))
        );
        winner = tickets[random % ticketCount];
        if (winner == address(0)) {
            revert TicketNotFound();
        }

        // Transfer points to winner
        bool success = IERC20(superchainPoints).transfer(winner, jackpot);
        if (!success) {
            revert TransferFailed();
        }

        emit RaffleWinner(winner, jackpot);
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function claimTickets() public {
        // Verify raffle is ongoing
        if (winner != address(0) || !initialized) {
            revert NoOngoingRaffle();
        }

        // Calculate tickets allocation. Maximum possible
        uint256 ticketsAllocation = getClaimableTickets(msg.sender);
        if (ticketsAllocation == 0) {
            revert NoTicketsToClaim();
        }

        // Allocate tickets to user
        for (
            uint256 i = ticketCount;
            i < ticketCount + ticketsAllocation;
            i++
        ) {
            tickets[i] = msg.sender;
        }
        ticketsClaimed[msg.sender] = ticketsAllocation;
        ticketCount += ticketsAllocation;

        emit TicketsClaimed(msg.sender, ticketsAllocation);
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function getClaimableTickets(address user) public view returns (uint256) {
        uint256 ticketsAllocation = 0;
        for (uint256 i = 0; i < eligibleBadges.length; i++) {
            if (superchainBadges.balanceOf(user, eligibleBadges[i]) > 0) {
                if (badgeAllocations[eligibleBadges[i]] > ticketsAllocation) {
                    ticketsAllocation = badgeAllocations[eligibleBadges[i]];
                }
            }
        }

        return ticketsAllocation - ticketsClaimed[user];
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function getClaimedTickets(address user) public view returns (uint256) {
        return ticketsClaimed[user];
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function getTotalTickets() public view returns (uint256) {
        return ticketCount;
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function getJackpot() public view returns (uint256) {
        return jackpot;
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function getEligibleBadges() external view returns (uint256[] memory) {
        return eligibleBadges;
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function getWinner() external view returns (address) {
        return winner;
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function getRevealedAfter() external view returns (uint256) {
        return revealAfterTimestamp;
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function isOngoing() public view returns (bool) {
        return initialized && winner == address(0);
    }
}
