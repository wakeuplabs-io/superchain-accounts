import { Address } from "viem";

import { Clients, getClient } from "./client";

// Ignition
import { ignition } from "hardhat";
import entryPointMockModule from "../../../ignition/modules/EntryPointMock";
import buildWakeUpPaymasterModule from "../../../ignition/modules/Paymaster";
import { WakeUpPaymasterService } from "../../paymaster/service";

/**
 * Interface for the result of a token deployment.
 */
interface DeployResult {
  address: Address;
}

/**
 * Deploys EntryPointMock contract using the Ignition deployment framework.
 *
 * @returns A promise that resolves with the address of the deployed EntryPointMock.
 * @throws If the deployment fails.
 */
export const deployEntryPointMock = async (): Promise<Address> => {
  try {
    const { entryPointMock } = await ignition.deploy(entryPointMockModule);
    if (!entryPointMock) throw new Error("EntryPointMock deployment failed.");
    return (entryPointMock as DeployResult).address;
  } catch (error) {
    console.error("Error deploying EntryPointMock:", error);
    throw error;
  }
};

export const deployPaymaster = async (entryPointAddress: Address): Promise<Address> => {
  try {
    const { wakeUpPaymaster } = await ignition.deploy(buildWakeUpPaymasterModule(entryPointAddress));
    if (!wakeUpPaymaster) throw new Error("WakeUpPaymaster deployment failed.");
    return (wakeUpPaymaster as DeployResult).address;
  } catch (error) {
    console.error("Error deploying WakeUpPaymaster:", error);
    throw error;
  }
};

/**
 * Type representing the test environment for token interactions.
 */
export type TestEnv = {
  clients: Clients;
  paymaster: Address;
  paymasterService: WakeUpPaymasterService;
};

/**
 * Generates a test environment for token interactions.
 *
 * @returns A promise that resolves with a TestEnv object containing the token address, clients, and service.
 * @throws If the test environment setup fails.
 */
export const generateTestEnv = async (): Promise<TestEnv> => {
  try {
    const clients = await getClient();

    //Deploy EntryPoint mock
    const entryPointMock = await deployEntryPointMock();

    // Deploy WakeUpPaymaster
    const paymaster = await deployPaymaster(entryPointMock);

    // Create a WakeUpPaymasterService instance
    const paymasterService = new WakeUpPaymasterService(clients.publicClient, clients.owner, entryPointMock, paymaster);

    return {
      clients,
      paymaster,
      paymasterService,
    };
  } catch (error) {
    console.error("Error generating test environment:", error);
    throw error;
  }
};
