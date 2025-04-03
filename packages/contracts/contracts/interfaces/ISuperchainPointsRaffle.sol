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
    event RaffleRevealed(address winner);
    event TicketClaimed(address claimer);
}

interface ISuperchainPointsRaffle is ISuperchainPointsRaffleErrors, ISuperchainPointsRaffleEvents {

}