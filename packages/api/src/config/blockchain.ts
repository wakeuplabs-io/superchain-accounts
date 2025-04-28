import envParsed from "@/envParsed";

const {
  UNICHAIN_CHAIN_ID,
  BASE_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  RPC_UNICHAIN,
  RPC_BASE,
  RPC_OPTIMISM,
  BUNDLER_UNICHAIN,
  BUNDLER_BASE,
  BUNDLER_OPTIMISM,
  ENTRYPOINT_UNICHAIN,
  ENTRYPOINT_BASE,
  ENTRYPOINT_OPTIMISM,
  AAVE_CONTRACT_ADDRESS_UNICHAIN,
  AAVE_CONTRACT_ADDRESS_BASE,
  AAVE_CONTRACT_ADDRESS_OPTIMISM,
  OWNER_PRIVATE_KEY: _OWNER_PRIVATE_KEY,
} = envParsed();

export const TRANSPORTS_URLS: {
  [chainId: string]: string;
} = {
  [UNICHAIN_CHAIN_ID]: RPC_UNICHAIN,
  [BASE_CHAIN_ID]: RPC_BASE,
  [OPTIMISM_CHAIN_ID]: RPC_OPTIMISM,
};

export const SMART_ACCOUNTS: {
  [chainId: string]: {
    bundlerUrl: string;
    entryPoint: string;
  };
} = {
  [UNICHAIN_CHAIN_ID]: {
    bundlerUrl: BUNDLER_UNICHAIN,
    entryPoint: ENTRYPOINT_UNICHAIN,
  },
  [BASE_CHAIN_ID]: {
    bundlerUrl: BUNDLER_BASE,
    entryPoint: ENTRYPOINT_BASE,
  },
  [OPTIMISM_CHAIN_ID]: {
    bundlerUrl: BUNDLER_OPTIMISM,
    entryPoint: ENTRYPOINT_OPTIMISM,
  },
};

export const AAVE_CONTRACT_ADDRESS: {
  [chainId: string]: `0x${string}`;
} = {
  [UNICHAIN_CHAIN_ID]: AAVE_CONTRACT_ADDRESS_UNICHAIN as `0x${string}`,
  [BASE_CHAIN_ID]: AAVE_CONTRACT_ADDRESS_BASE as `0x${string}`,
  [OPTIMISM_CHAIN_ID]: AAVE_CONTRACT_ADDRESS_OPTIMISM as `0x${string}`,
};

export const OWNER_PRIVATE_KEY = _OWNER_PRIVATE_KEY as `0x${string}`;
