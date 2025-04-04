// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/interfaces/IERC1155.sol";
import {ISuperchainPointsRaffle} from "./interfaces/ISuperchainPointsRaffle.sol";

/// @title SuperchainPointsRaffle
/// @notice A raffle contract using https://fravoll.github.io/solidity-patterns/randomness.html pattern for randomness
contract SuperchainPointsRaffle is ISuperchainPointsRaffle, Ownable {
    bool public finished = false;
    bool internal initialized = false;

    bytes32 public sealedSeed;
    uint256 public storedBlockNumber;

    IERC20 public superchainPoints;
    IERC1155 public superchainBadges;

    uint256 public prize;
    address public winner;

    uint256 public ticketCount;
    mapping(uint256 => address) public tickets;
    mapping(address => bool) public ticketsClaimed;

    uint256[] public eligibleBadges;
    mapping(uint256 => uint256) public badgeAllocations;

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
        uint256 _amount,
        uint256[] memory _badges,
        uint256[] memory _badgeAllocation
    ) public onlyOwner {
        if (initialized) {
            revert RaffleAlreadyStarted();
        }

        // Mark raffle as initialized
        initialized = true;
        finished = false;

        // Store seed
        sealedSeed = _sealedSeed;
        storedBlockNumber = block.number + 1;

        // Store raffle details
        prize = _amount;

        // Cleanup tickets
        for (uint256 i = 0; i < ticketCount; i++) {
            tickets[i] = address(0);
        }
        ticketCount = 0;

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
            prize
        );
        if (!success) {
            revert TransferFailed();
        }

        emit RaffleStarted(sealedSeed, prize);
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function revealWinner(bytes32 _seed) public onlyOwner {
        // Verify raffle is ongoing
        if (finished || !initialized) {
            revert NoOngoingRaffle();
        }

        // Mark raffle as finished right away to prevent reentrancy
        finished = true;

        // If we reveal in same block we can know block hash
        if (storedBlockNumber > block.number) {
            revert CannotRevealBeforeBlock(storedBlockNumber);
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
        bool success = IERC20(superchainPoints).transfer(winner, prize);
        if (!success) {
            revert TransferFailed();
        }

        emit RaffleWinner(winner, prize);
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function claimTickets() public {
        // Verify raffle is ongoing
        if (finished || !initialized) {
            revert NoOngoingRaffle();
        }

        // Check if tickets have already been claimed
        if (ticketsClaimed[msg.sender]) {
            revert TicketAlreadyClaimed();
        }
        ticketsClaimed[msg.sender] = true;

        // Calculate tickets allocation. Maximum possible
        uint256 ticketsAllocation = 0;
        for (uint256 i = 0; i < eligibleBadges.length; i++) {
            if (superchainBadges.balanceOf(msg.sender, eligibleBadges[i]) > 0) {
                if (badgeAllocations[eligibleBadges[i]] > ticketsAllocation) {
                    ticketsAllocation = badgeAllocations[eligibleBadges[i]];
                }
            }
        }

        // Check if user has eligible badges
        if (ticketsAllocation == 0) {
            revert NoEligibleBadges();
        }

        // Allocate tickets to user
        for (
            uint256 i = ticketCount;
            i < ticketCount + ticketsAllocation;
            i++
        ) {
            tickets[i] = msg.sender;
        }
        ticketCount += ticketsAllocation;

        emit TicketsClaimed(msg.sender, ticketsAllocation);
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function getEligibleBadges() external view returns (uint256[] memory) {
        return eligibleBadges;
    }

    /// @inheritdoc ISuperchainPointsRaffle
    function isFinished() external view returns (bool) {
        return finished;
    }
}
