// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Raffle is Ownable {

    bytes32 sealedSeed;
    bool seedSet = false;
    bool finished = false;
    uint storedBlockNumber;

    address public superchainPoints;
    uint256 public raffleAmount;

    uint256 public ticketCount;
    mapping(address => uint256) public tickets;

    constructor(address initialOwner, address _superchainPoints) Ownable(initialOwner) {
        superchainPoints = _superchainPoints;
    }

    function initiate(bytes32 _sealedSeed, uint256 _amount) public onlyOwner { // TODO: badge requirements
        require(!seedSet);
        finished = true;
        sealedSeed = _sealedSeed;
        storedBlockNumber = block.number + 1;
        seedSet = true;

        raffleAmount = _amount;

        // TODO: pull funds from sender
    }

    function reveal(bytes32 _seed) public onlyOwner {
        require(!finished);
        require(seedSet);
        require(storedBlockNumber < block.number);
        require(keccak256(msg.sender, _seed) == sealedSeed);
        uint random = uint(keccak256(_seed, blockhash(storedBlockNumber)));
        // Insert logic for usage of random number here;
        seedSet = false;
        finished = false;


        // TODO: transfer to winner
    }

    function claimTicket() { 
        // TODO: badge requirements

        // TODO: assign 
        
    }
}