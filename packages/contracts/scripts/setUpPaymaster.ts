import { Address, Chain, createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import {baseSepolia, optimism, optimismSepolia, sepolia} from "viem/chains";
import { getLocalOpChain } from "./utils";
import envParsed  from "../envParsed";
import { Networks } from "../networks";

const envVars = envParsed();

const paymasterAbi = parseAbi([
  "function getDeposit() public view returns (uint256)",
  "function deposit() public payable",
]);

const availableChains: Record<Networks, Chain> = {
  "optimism": optimism,
  "optimism-sepolia": optimismSepolia,
  "base-sepolia": baseSepolia,
  "sepolia": sepolia,
};

function getNetworkConfig(): {chain: Chain, privateKey: Address} {
  const networkIdx = process.argv.findIndex((arg) => arg === "--network");
  
  if (networkIdx === -1) {
    throw new Error("--network argument not found");
  }

  const network = process.argv[networkIdx + 1];
  
  switch (network) {
  case "local":
    if(!envVars.LOCAL_PRIVATE_KEY) {
      throw new Error("Missing local configurations");
    }

    return {
      chain: getLocalOpChain(),
      privateKey: envVars.LOCAL_PRIVATE_KEY,
    };
  case "mainnet":
    if(!availableChains[envVars.NETWORK_MAINNET] || !envVars.MAINNET_PRIVATE_KEY) {
      throw new Error("Missing mainnet configurations");
    }

    return {
      chain: availableChains[envVars.NETWORK_MAINNET],
      privateKey: envVars.MAINNET_PRIVATE_KEY,
    };
  case "testnet":
    if(!availableChains[envVars.NETWORK_TESTNET] || !envVars.TESTNET_PRIVATE_KEY) {
      throw new Error("Missing testnet configurations");
    }

    return {
      chain: availableChains[envVars.NETWORK_TESTNET],
      privateKey: envVars.TESTNET_PRIVATE_KEY,
    };
  default:
    throw new Error(`Unknown network: ${network}`);
  }
}

function getPaymasterAddress() {
  const paymasterIdx = process.argv.findIndex((arg) => arg === "--paymaster");

  if (paymasterIdx === -1) {
    throw new Error("--paymaster argument not found");
  }

  return process.argv[paymasterIdx + 1] as Address;
}

(async () => {
  const {chain, privateKey} = getNetworkConfig();
  const paymasterAddress = getPaymasterAddress();

  console.log(`Deposit funds into the paymaster - Network ${chain.name}`);

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const account = privateKeyToAccount(privateKey);

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(),
  });

  // Deposit funds into the paymaster
  const { request } = await publicClient.simulateContract({
    account,
    address: paymasterAddress,
    abi: paymasterAbi,
    functionName: "deposit",
    value: BigInt(0.01e18),
  });

  const tx = await walletClient.writeContract(request);

  await publicClient.waitForTransactionReceipt({
    hash: tx,
  });

  const paymasterDeposit = await publicClient.readContract({
    address: paymasterAddress,
    abi: paymasterAbi,
    functionName: "getDeposit",
  });

  console.log("Paymaster deposit:", paymasterDeposit);
})();
