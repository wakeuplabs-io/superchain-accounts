import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-chai-matchers";
import "solidity-coverage";

import { getNetwork } from "./networks";
import envParsed from "./envParsed";

const NETWORK_TESTNET = envParsed().NETWORK_TESTNET;
const NETWORK_MAINNET = envParsed().NETWORK_MAINNET;

const networkTestnet = getNetwork(NETWORK_TESTNET, true);
const networkMainnet = getNetwork(NETWORK_MAINNET, false);

const localNetwork =
  envParsed().LOCAL_RPC_URL && envParsed().LOCAL_PRIVATE_KEY
    ? {
      url: envParsed().LOCAL_RPC_URL,
      accounts: [envParsed().LOCAL_PRIVATE_KEY],
    }
    : undefined;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{ version: "0.8.29", settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    }}],
  },
  networks: {
    testnet: networkTestnet ? networkTestnet.network : undefined,
    mainnet: networkMainnet ? networkMainnet.network : undefined,
    ...(localNetwork ? { local: localNetwork } : {}),
  },

  etherscan: {
    apiKey: networkTestnet ? networkTestnet.apiKeys : undefined,
    customChains: networkTestnet ? networkTestnet.customChains : undefined,
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
