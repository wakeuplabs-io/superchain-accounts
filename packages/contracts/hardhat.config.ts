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
    optimism: {
      chainId: 10,
      url: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    base: {
      chainId: 8453,
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    unichain: {
      chainId: 130,
      url: process.env.UNICHAIN_RPC_URL || "https://mainnet.unichain.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "optimism-sepolia": {
      chainId: 11155420,
      url:
        process.env.OPTIMISM_TESTNET_RPC_URL ||
        process.env.OPTIMISM_SEPOLIA_RPC_URL ||
        "https://sepolia.optimism.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "base-sepolia": {
      chainId: 84532,
      url:
        process.env.BASE_TESTNET_RPC_URL ||
        process.env.BASE_SEPOLIA_RPC_URL ||
        "https://base-sepolia.public.blastapi.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    "unichain-sepolia": {
      chainId: 1301,
      url:
        process.env.UNICHAIN_TESTNET_RPC_URL ||
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
      "optimism-sepolia":
        process.env.OPTIMISM_TESTNET_ETHERSCAN_API_KEY ||
        process.env.OPTIMISM_SEPOLIA_ETHERSCAN_API_KEY!,
      "base-sepolia":
        process.env.BASE_TESTNET_ETHERSCAN_API_KEY ||
        process.env.BASE_SEPOLIA_ETHERSCAN_API_KEY!,
      "unichain-sepolia":
        process.env.UNICHAIN_TESTNET_ETHERSCAN_API_KEY ||
        process.env.UNICHAIN_SEPOLIA_ETHERSCAN_API_KEY!,
      optimism: process.env.OPTIMISM_ETHERSCAN_API_KEY!,
      base: process.env.BASE_ETHERSCAN_API_KEY!,
      unichain: process.env.UNICHAIN_ETHERSCAN_API_KEY!,
    },
    customChains: [
      {
        chainId: 10,
        urls: {
          apiURL: "https://optimism.blockscout.com/api/",
          browserURL: "https://optimism.blockscout.com/",
        },
        network: "optimism",
      },
      {
        chainId: 8453,
        urls: {
          apiURL: "https://base.blockscout.com/api/",
          browserURL: "https://base.blockscout.com/",
        },
        network: "base",
      },
      {
        chainId: 130,
        urls: {
          apiURL: "https://unichain.blockscout.com/api/",
          browserURL: "https://unichain.blockscout.com/",
        },
        network: "unichain",
      },
      {
        chainId: 11155420,
        urls: {
          apiURL: "https://optimism-sepolia.blockscout.com/api/",
          browserURL: "https://optimism-sepolia.blockscout.com/",
        },
        network: "optimism-sepolia",
      },
      {
        chainId: 84532,
        urls: {
          apiURL: "https://base-sepolia.blockscout.com/api/",
          browserURL: "https://base-sepolia.blockscout.com/",
        },
        network: "base-sepolia",
      },
      {
        chainId: 1301,
        urls: {
          apiURL: "https://unichain-sepolia.blockscout.com/api/",
          browserURL: "https://unichain-sepolia.blockscout.com/",
        },
        network: "unichain-sepolia",
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
