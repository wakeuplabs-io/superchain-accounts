import envParsed from "@/envParsed";

const UNICHAIN_SEPOLIA_ID = 1301;
const BASE_SEPOLIA_ID = 84532;
const OPTIMISM_SEPOLIA_ID = 11155420;

// TODO: add production chain IDs. How do we config in production?

export const TRANSPORTS_URLS: {
  [chainId: string]: string;
} = {
  UNICHAIN_SEPOLIA_ID: envParsed().RPC_UNICHAIN_SEPOLIA,
  "84532": envParsed().RPC_BASE_SEPOLIA,
  "11155420": envParsed().RPC_OPTIMISM_SEPOLIA,
};

export const SMART_ACCOUNTS: {
  [chainId: string]: {
    bundlerUrl: string;
    entryPoint: string;
  };
} = {
  UNICHAIN_SEPOLIA_ID: {
    bundlerUrl: envParsed().BUNDLER_UNICHAIN_SEPOLIA,
    entryPoint: envParsed().ENTRYPOINT_UNICHAIN_SEPOLIA,
  },
  "84532": {
    bundlerUrl: envParsed().BUNDLER_BASE_SEPOLIA,
    entryPoint: envParsed().ENTRYPOINT_BASE_SEPOLIA,
  },
  "11155420": {
    bundlerUrl: envParsed().BUNDLER_OPTIMISM_SEPOLIA,
    entryPoint: envParsed().ENTRYPOINT_OPTIMISM_SEPOLIA,
  },
};

export const OWNER_PRIVATE_KEY = envParsed().OWNER_PRIVATE_KEY as `0x${string}`;
