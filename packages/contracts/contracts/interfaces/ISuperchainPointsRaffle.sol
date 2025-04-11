// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

interface ISuperchainPointsRaffleErrors {
    /// @notice Error thrown when the raffle is already started
    error RaffleAlreadyStarted();

    /// @notice Error thrown when the raffle is not started
    error NoOngoingRaffle();

    /// @notice Error thrown when points transfer fails
    error TransferFailed();

    /// @notice Random pattern requires seed to be revealed in a future block
    error CannotRevealBeforeBlock(uint256);

    /// @notice UX requires reveal after timestamp
    error CannotRevealBeforeTimestamp(uint256 timestamp);

    /// @notice Error thrown when the seed doesn't match the sealed seed
    error InvalidSeed();

    /// @notice Error thrown when the ticket is not found
    error TicketNotFound();

    /// @notice Error thrown when user has no tickets to claim, either because they are not eligible or they have already claimed
    error NoTicketsToClaim();

    /// @notice Error thrown when the seed has already been used
    error SeedAlreadyUsed();
}

interface ISuperchainPointsRaffleEvents {
    /// @notice Event emitted when a raffle is started
    /// @param sealedSeed The seed used to generate the raffle
    /// @param amount The amount of points to be distributed to the raffle winner
    event RaffleStarted(bytes32 sealedSeed, uint256 amount);

    /// @notice Event emitted when a raffle is finished
    /// @param winner The address of the raffle winner
    /// @param amount The amount of points distributed to the raffle winner
    event RaffleWinner(address winner, uint256 amount);

    /// @notice Event emitted when tickets are claimed
    /// @param claimer The address of the claimer
    /// @param amount The amount of points claimed
    event TicketsClaimed(address claimer, uint256 amount);
}

interface ISuperchainPointsRaffle is
    ISuperchainPointsRaffleErrors,
    ISuperchainPointsRaffleEvents
{
    /// @notice Starts the raffle
    /// @param _sealedSeed The seed used to generate the raffle. Must be kekkak256(abi.encodePacked(msg.sender, _seed))
    /// @param _amount The amount of points to be distributed to the raffle winner
    /// @param _badges The badges that are eligible to participate in the raffle
    /// @param _badgeAllocation The number of tickets allocated to each badge
    function initialize(
        bytes32 _sealedSeed,
        uint256 _revealAfterTimestamp,
        uint256 _amount,
        uint256[] memory _badges,
        uint256[] memory _badgeAllocation
    ) external;

    /// @notice Reveals the raffle winner and transfers the points
    /// @param _seed The seed used to generate the raffle
    function revealWinner(bytes32 _seed) external;

    /// @notice Returns the timestamp at which the seed will be revealed
    function getRevealedAfter() external view returns (uint256);

    /// @notice Returns the badges that are eligible to participate in the raffle
    function getEligibleBadges() external view returns (uint256[] memory);

    /// @notice Returns the amount of points that are distributed to the raffle winner
    function getJackpot() external view returns (uint256);

    /// @notice Returns the total number of tickets that can be claimed
    function getTotalTickets() external view returns (uint256);

    /// @notice Returns the number of tickets that can be claimed
    /// @param user The address of the user
    function getClaimableTickets(address user) external view returns (uint256);

    /// @notice Returns the number of tickets already claimed
    /// @param user The address of the user
    function getClaimedTickets(address user) external view returns (uint256);

    /// @notice Claim tickets to participate in raffle
    function claimTickets() external;

    /// @notice Returns the address of the raffle winner
    function getWinner() external view returns (address);

    /// @notice Returns whether the raffle is ongoing
    function isOngoing() external view returns (bool);
}
