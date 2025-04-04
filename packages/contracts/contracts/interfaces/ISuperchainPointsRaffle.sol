// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

interface ISuperchainPointsRaffleErrors {
    error RaffleAlreadyStarted();
    error NoOngoingRaffle();
    error TransferFailed();
    error CannotRevealBeforeBlock(uint256);
    error InvalidSeed();
    error SeedAlreadySet();
    error TicketNotFound();
    error TicketAlreadyClaimed();
    error NoEligibleBadges();
    error SeedAlreadyUsed();
}

interface ISuperchainPointsRaffleEvents {
    event RaffleStarted(uint256 raffleId, bytes32 seed, uint256 amount);
    event RaffleWinner(uint256 raffleId, address winner, uint256 amount);
    event TicketsClaimed(uint256 raffleId, address claimer, uint256 amount);
}

interface ISuperchainPointsRaffle is ISuperchainPointsRaffleErrors, ISuperchainPointsRaffleEvents {

}