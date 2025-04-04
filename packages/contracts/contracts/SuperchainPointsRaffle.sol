// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/interfaces/IERC1155.sol";
import {ISuperchainPointsRaffle} from "./interfaces/ISuperchainPointsRaffle.sol";

contract SuperchainPointsRaffle is ISuperchainPointsRaffle, Ownable {
    bool public finished = false;
    bool internal initialized = false;

    bytes32 public sealedSeed;
    uint256 public storedBlockNumber;
    mapping(bytes32 => bool) public sealedSeeds;

    address public superchainPoints;
    address public superchainBadges;

    uint256 public raffleId = 0;
    mapping(uint256 => uint256) public prize;
    mapping(uint256 => address) public winners;

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
        if (initialized) {
            revert RaffleAlreadyStarted();
        }

        if (sealedSeeds[_sealedSeed]) {
            revert SeedAlreadyUsed();
        }

        // Mark raffle as initialized
        initialized = true;
        finished = false;

        // Store seed
        sealedSeed = _sealedSeed;
        sealedSeeds[_sealedSeed] = true;
        storedBlockNumber = block.number + 1;
        
        // Store raffle details
        raffleId += 1;
        prize[raffleId] = _amount;

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
        bool success = IERC20(superchainPoints).transferFrom(
            msg.sender,
            address(this),
            prize[raffleId]
        );
        if (!success) {
            revert TransferFailed();
        }

        emit RaffleStarted(raffleId, sealedSeed, prize[raffleId]);
    }

    function reveal(bytes32 _seed) public onlyOwner {
        // Verify raffle is ongoing
        if (finished || !initialized) {
            revert NoOngoingRaffle();
        }

        // Mark raffle as finished right away to prevent reentrancy
        finished = true;
        initialized = false;

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
        winners[raffleId] = tickets[random % ticketCount];
        if (winners[raffleId] == address(0)) {
            revert TicketNotFound();
        }

        // Transfer points to winner
        bool success = IERC20(superchainPoints).transfer(
            winners[raffleId],
            prize[raffleId]
        );
        if (!success) {
            revert TransferFailed();
        }

        emit RaffleWinner(raffleId, winners[raffleId], prize[raffleId]);
    }

    function claim() public {
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

        emit TicketsClaimed(raffleId, msg.sender, ticketsAllocation);
    }

    function getEligibleBadges() external view returns (uint256[] memory) {
        return eligibleBadges;
    }
}
