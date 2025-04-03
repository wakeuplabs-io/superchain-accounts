// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title PredeployAddresses
/// @notice Subset of the Predeploys.sol library.

library PredeployAddresses {
    /// @notice Address of the canonical WETH contract.
    address internal constant WETH = 0x4200000000000000000000000000000000000006;

    /// @notice Address of the CrossL2Inbox predeploy.
    address internal constant CROSS_L2_INBOX =
        0x4200000000000000000000000000000000000022;

    /// @notice Address of the L2ToL2CrossDomainMessenger predeploy.
    address internal constant L2_TO_L2_CROSS_DOMAIN_MESSENGER =
        0x4200000000000000000000000000000000000023;

    /// @notice Address of the SuperchainWETH predeploy.
    address internal constant SUPERCHAIN_WETH =
        0x4200000000000000000000000000000000000024;

    /// @notice Address of the ETHLiquidity predeploy.
    address internal constant ETH_LIQUIDITY =
        0x4200000000000000000000000000000000000025;

    /// @notice Address of the SuperchainTokenBridge predeploy.
    address internal constant SUPERCHAIN_TOKEN_BRIDGE =
        0x4200000000000000000000000000000000000028;

    /// @notice Address of Promise.sol. This is likely to change.
    address internal constant PROMISE =
        0xFcdC08d2DFf80DCDf1e954c4759B3316BdE86464;
}
