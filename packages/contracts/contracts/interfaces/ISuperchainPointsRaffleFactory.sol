// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

interface ISuperchainPointsRaffleFactoryErrors {
    /// @notice Cannot create a raffle if one is already started
    error OngoingRaffle();
}

interface ISuperchainPointsRaffleFactoryEvents {
    /// @notice Emitted when a raffle is created
    event RaffleCreated(address raffle);
}

interface ISuperchainPointsRaffleFactory is
    ISuperchainPointsRaffleFactoryErrors,
    ISuperchainPointsRaffleFactoryEvents
{
    /// @notice Checks previous raffle state and creates a new raffle
    function createRaffle() external;
}
