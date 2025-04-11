import envParsed from "@/envParsed";

export const UNICHAIN_CHAIN_ID = "1301";
export const BASE_CHAIN_ID = "84532";
export const OPTIMISM_CHAIN_ID = "11155420";

export const TRANSPORTS_URLS: {
  [chainId: string]: string;
} = {
  [UNICHAIN_CHAIN_ID]: envParsed().RPC_UNICHAIN_SEPOLIA,
  [BASE_CHAIN_ID]: envParsed().RPC_BASE_SEPOLIA,
  [OPTIMISM_CHAIN_ID]: envParsed().RPC_OPTIMISM_SEPOLIA,
};

export const SMART_ACCOUNTS: {
  [chainId: string]: {
    bundlerUrl: string;
    entryPoint: string;
  };
} = {
  [UNICHAIN_CHAIN_ID]: {
    bundlerUrl: envParsed().BUNDLER_UNICHAIN_SEPOLIA,
    entryPoint: envParsed().ENTRYPOINT_UNICHAIN_SEPOLIA,
  },
  [BASE_CHAIN_ID]: {
    bundlerUrl: envParsed().BUNDLER_BASE_SEPOLIA,
    entryPoint: envParsed().ENTRYPOINT_BASE_SEPOLIA,
  },
  [OPTIMISM_CHAIN_ID]: {
    bundlerUrl: envParsed().BUNDLER_OPTIMISM_SEPOLIA,
    entryPoint: envParsed().ENTRYPOINT_OPTIMISM_SEPOLIA,
  },
};

export const OWNER_PRIVATE_KEY = envParsed().OWNER_PRIVATE_KEY as `0x${string}`;
