// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/interfaces/IERC1155.sol";
import {ISuperchainPointsRaffle} from "./interfaces/ISuperchainPointsRaffle.sol";

contract SuperchainPointsRaffle is ISuperchainPointsRaffle, Ownable {
    bytes32 public sealedSeed;
    bool internal initialized = false;
    bool public finished = false;
    uint256 public storedBlockNumber;
    address public winner;

    uint256 public raffleAmount;
    address public superchainPoints;
    address public superchainBadges;

    uint256 public ticketCount;
    mapping(uint256 => address) public tickets;
    mapping(address => bool) public ticketsClaimed;
    uint256[] public eligibleBadges;
    mapping(uint256 => uint256) public badgeAllocations;

    /// @dev Explain to a developer any extra details
    /// @param _initialOwner The initial owner of the contract
    /// @param _superchainPoints The address of the SuperchainPoints contract
    /// @param _superchainBadges The address of the SuperchainBadges contract
    constructor(
        address _initialOwner,
        address _superchainPoints,
        address _superchainBadges
    ) Ownable(_initialOwner) {
        superchainPoints = _superchainPoints;
        superchainBadges = _superchainBadges;
    }

    function initialize(
        bytes32 _sealedSeed,
        uint256 _amount,
        uint256[] memory _badges,
        uint256[] memory _badgeAllocation
    ) public onlyOwner {
        // Verify raffle is not initialized
        if (initialized) {
            revert RaffleAlreadyStarted();
        }
        initialized = true;

        // Store raffle details
        raffleAmount = _amount;
        sealedSeed = _sealedSeed;
        storedBlockNumber = block.number + 1;

        // Store badge details
        for (uint256 i = 0; i < _badges.length; i++) {
            badgeAllocations[_badges[i]] = _badgeAllocation[i];
            eligibleBadges.push(_badges[i]);
        }

        // Pull points from sender
        bool success = IERC20(superchainPoints).transferFrom(
            msg.sender,
            address(this),
            raffleAmount
        );
        if (!success) {
            revert TransferFailed();
        }

        emit RaffleStarted(_sealedSeed, raffleAmount);
    }

    function reveal(bytes32 _seed) public onlyOwner {
        // Verify raffle is ongoing
        if (finished || !initialized) {
            revert NoOngoingRaffle();
        }

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

        // Mark raffle as finished before transfer to prevent reentrancy
        finished = true;

        // Transfer points to winner
        bool success = IERC20(superchainPoints).transfer(winner, raffleAmount);
        if (!success) {
            revert TransferFailed();
        }

        emit RaffleWinner(winner);
    }

    function claimTicket() public {
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
            if (
                IERC1155(superchainBadges).balanceOf(
                    msg.sender,
                    eligibleBadges[i]
                ) > 0
            ) {
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
}
