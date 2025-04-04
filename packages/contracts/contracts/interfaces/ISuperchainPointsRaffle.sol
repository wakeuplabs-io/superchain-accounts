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
}

interface ISuperchainPointsRaffleEvents {
    event RaffleStarted(bytes32 seed, uint256 amount);
    event RaffleWinner(address winner);
    event TicketsClaimed(address claimer, uint256 amount);
}

interface ISuperchainPointsRaffle is ISuperchainPointsRaffleErrors, ISuperchainPointsRaffleEvents {

}