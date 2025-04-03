// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ISuperchainPointsRaffle} from "./interfaces/ISuperchainPointsRaffle.sol";

contract SuperchainPointsRaffle is ISuperchainPointsRaffle, Ownable {
    bytes32 sealedSeed;
    bool seedSet = false;
    bool finished = false;
    uint storedBlockNumber;

    address public superchainPoints;
    uint256 public raffleAmount;

    uint256 public ticketCount;
    mapping(uint256 => address) public tickets;
    mapping(address => bool) public ticketsClaimed;

    constructor(
        address initialOwner,
        address _superchainPoints
    ) Ownable(initialOwner) {
        superchainPoints = _superchainPoints;
    }

    function initiate(bytes32 _sealedSeed, uint256 _amount) public onlyOwner {
        // TODO: badge requirements
        require(!seedSet);
        finished = false;
        sealedSeed = _sealedSeed;
        storedBlockNumber = block.number + 1;
        seedSet = true;

        raffleAmount = _amount;

        // pull points from sender
        bool success = IERC20(superchainPoints).transferFrom(
            msg.sender,
            address(this),
            raffleAmount
        );
        require(success);
    }

    function reveal(bytes32 _seed) public onlyOwner {
        require(!finished);
        require(seedSet);
        require(storedBlockNumber < block.number);
        require(keccak256(abi.encodePacked(msg.sender, _seed)) == sealedSeed);
        uint random = uint(keccak256(abi.encodePacked(_seed, blockhash(storedBlockNumber))));
        // Insert logic for usage of random number here;
        seedSet = false;
        finished = false;

        // TODO: transfer to winner
    }

    function claimTicket() public {
        // TODO: badge requirements

        // TODO: check if user has already claimed a ticket

        // TODO: determine allocation based on badges
        uint256 ticketsAllocation = 10;

        // allocate tickets to user
        for (uint256 i = ticketCount; i < ticketCount + ticketsAllocation; i++) {
            tickets[i] = msg.sender;
        }
        
        ticketCount += ticketsAllocation;
        ticketsClaimed[msg.sender] = true;

    }
}
