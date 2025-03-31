// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.29;

// Based on PimlicoEntryPointSimulations contract (address: 0xBbe8A301FbDb2a4CD58c4A37c262ecef8f889c47)

import "@account-abstraction/contracts/core/EntryPointSimulations.sol";
import "@account-abstraction/contracts/utils/Exec.sol";

contract WakeUpEntryPointSimulations {
    EntryPointSimulations internal eps = new EntryPointSimulations();

    uint256 private constant REVERT_REASON_MAX_LEN =
        0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
    bytes4 private constant selector =
        bytes4(keccak256("delegateAndRevert(address,bytes)"));

    constructor() {}

    function simulateEntryPoint(
        address payable ep,
        bytes[] memory data
    ) public returns (bytes[] memory) {
        bytes[] memory returnDataArray = new bytes[](data.length);

        for (uint i = 0; i < data.length; i++) {
            bytes memory returnData;
            bytes memory callData = abi.encodeWithSelector(
                selector,
                address(eps),
                data[i]
            );
            bool success = Exec.call(ep, 0, callData, gasleft());
            if (!success) {
                returnData = Exec.getReturnData(REVERT_REASON_MAX_LEN);
            }
            returnDataArray[i] = returnData;
        }

        return returnDataArray;
    }
}
