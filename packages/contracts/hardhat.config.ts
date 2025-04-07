import "dotenv/config";

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "solidity-coverage";

import "./tasks/badges";
import "./tasks/raffle";
import "./tasks/paymaster";
import "./tasks/points";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.29",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
    ],
  },
  networks: {
    local: {
      chainId: 31337,
      url: "http://localhost:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "ethereum-sepolia": {
      chainId: 11155111,
      url: process.env.ETHEREUM_SEPOLIA_RPC_URL || "https://sepolia.drpc.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "optimism-sepolia": {
      chainId: 11155420,
      url:
        process.env.OPTIMISM_SEPOLIA_RPC_URL || "https://sepolia.optimism.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "base-sepolia": {
      chainId: 84532,
      url:
        process.env.BASE_SEPOLIA_RPC_URL ||
        "https://base-sepolia.public.blastapi.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "unichain-sepolia": {
      chainId: 1301,
      url:
        process.env.UNICHAIN_SEPOLIA_RPC_URL ||
        "https://unichain-sepolia-rpc.publicnode.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  ignition: {
    strategyConfig: {
      create2: {
        salt: "0x0000000000000000000000000000000000000000000000000000000000000000",
      },
    },
  },
  etherscan: {
    apiKey: {
      "optimism-sepolia": process.env.OPTIMISM_SEPOLIA_ETHERSCAN_API_KEY!,
    },
    customChains: [
      {
        chainId: 11155420,
        urls: {
          apiURL: "https://optimism-sepolia.blockscout.com/api/",
          browserURL: "https://optimism-sepolia.blockscout.com/",
        },
        network: "optimism-sepolia",
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
