import envParsed from "@/envParsed";

export const TRANSPORTS_URLS: {
  [chainId: string]: string;
} = {
  "1301": envParsed().RPC_UNICHAIN_SEPOLIA,
  "84532": envParsed().RPC_BASE_SEPOLIA,
  "11155420": envParsed().RPC_OPTIMISM_SEPOLIA,
};

export const SMART_ACCOUNTS: {
  [chainId: string]: {
    bundlerUrl: string;
    entryPoint: string;
  };
} = {
  "1301": {
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
