import envParsed from "@/envParsed";

export const UNICHAIN_CHAIN_ID = "1301";
export const BASE_CHAIN_ID = "84532";
export const OPTIMISM_CHAIN_ID = "11155420";

export const TRANSPORTS_URLS: {
  [chainId: string]: string;
} = {
  [UNICHAIN_CHAIN_ID]: envParsed().RPC_UNICHAIN,
  [BASE_CHAIN_ID]: envParsed().RPC_BASE,
  [OPTIMISM_CHAIN_ID]: envParsed().RPC_OPTIMISM,
};

export const SMART_ACCOUNTS: {
  [chainId: string]: {
    bundlerUrl: string;
    entryPoint: string;
  };
} = {
  [UNICHAIN_CHAIN_ID]: {
    bundlerUrl: envParsed().BUNDLER_UNICHAIN,
    entryPoint: envParsed().ENTRYPOINT_UNICHAIN,
  },
  [BASE_CHAIN_ID]: {
    bundlerUrl: envParsed().BUNDLER_BASE,
    entryPoint: envParsed().ENTRYPOINT_BASE,
  },
  [OPTIMISM_CHAIN_ID]: {
    bundlerUrl: envParsed().BUNDLER_OPTIMISM,
    entryPoint: envParsed().ENTRYPOINT_OPTIMISM,
  },
};

export const AAVE_CONTRACT_ADDRESS: {
  [chainId: string]: `0x${string}`;
} = {
  [UNICHAIN_CHAIN_ID]: envParsed()
    .AAVE_CONTRACT_ADDRESS_UNICHAIN as `0x${string}`,
  [BASE_CHAIN_ID]: envParsed().AAVE_CONTRACT_ADDRESS_BASE as `0x${string}`,
  [OPTIMISM_CHAIN_ID]: envParsed()
    .AAVE_CONTRACT_ADDRESS_OPTIMISM as `0x${string}`,
};

export const OWNER_PRIVATE_KEY = envParsed().OWNER_PRIVATE_KEY as `0x${string}`;
