import { getAddress } from "viem";
import { z } from "zod";

// NOTE: DO NOT destructure process.env

console.log(import.meta.env.VITE_LOCAL_DEV);

const env = {
  APP_URL: import.meta.env.APP_URL,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  API_URL: import.meta.env.VITE_API_URL,
  BUNDLER_UNICHAIN:
    import.meta.env.VITE_BUNDLER_UNICHAIN ||
    import.meta.env.VITE_BUNDLER_UNICHAIN_SEPOLIA,
  BUNDLER_OPTIMISM:
    import.meta.env.VITE_BUNDLER_OPTIMISM ||
    import.meta.env.VITE_BUNDLER_OPTIMISM_SEPOLIA,
  BUNDLER_BASE:
    import.meta.env.VITE_BUNDLER_BASE ||
    import.meta.env.VITE_BUNDLER_BASE_SEPOLIA,
  RPC_BASE:
    import.meta.env.VITE_RPC_BASE || import.meta.env.VITE_RPC_BASE_SEPOLIA,
  RPC_OPTIMISM:
    import.meta.env.VITE_RPC_OPTIMISM ||
    import.meta.env.VITE_RPC_OPTIMISM_SEPOLIA,
  RPC_UNICHAIN:
    import.meta.env.VITE_RPC_UNICHAIN ||
    import.meta.env.VITE_RPC_UNICHAIN_SEPOLIA,
  ENTRYPOINT_UNICHAIN:
    import.meta.env.VITE_ENTRYPOINT_UNICHAIN ||
    import.meta.env.VITE_ENTRYPOINT_UNICHAIN_SEPOLIA,
  ENTRYPOINT_OPTIMISM:
    import.meta.env.VITE_ENTRYPOINT_OPTIMISM ||
    import.meta.env.VITE_ENTRYPOINT_OPTIMISM_SEPOLIA,
  ENTRYPOINT_BASE:
    import.meta.env.VITE_ENTRYPOINT_BASE ||
    import.meta.env.VITE_ENTRYPOINT_BASE_SEPOLIA,
  EXPLORER_BASE:
    import.meta.env.VITE_EXPLORER_BASE ||
    import.meta.env.VITE_EXPLORER_BASE_SEPOLIA,
  EXPLORER_OPTIMISM:
    import.meta.env.VITE_EXPLORER_OPTIMISM ||
    import.meta.env.VITE_EXPLORER_OPTIMISM_SEPOLIA,
  EXPLORER_UNICHAIN:
    import.meta.env.VITE_EXPLORER_UNICHAIN ||
    import.meta.env.VITE_EXPLORER_UNICHAIN_SEPOLIA,
  SUPERCHAIN_POINTS_ADDRESS: import.meta.env.VITE_SUPERCHAIN_POINTS_ADDRESS,
  SUPERCHAIN_BADGES_ADDRESS: import.meta.env.VITE_SUPERCHAIN_BADGES_ADDRESS,
  SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS: import.meta.env
    .VITE_SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS,
  WALLET_CONNECT_PROJECT_ID: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
};

const envSchema = z.object({
  APP_URL: z.string().url().optional().default("http://localhost:5000"),
  DEV: z.boolean(),
  PROD: z.boolean(),
  API_URL: z.string().url(),
  BUNDLER_UNICHAIN: z.string().url(),
  BUNDLER_OPTIMISM: z.string().url(),
  BUNDLER_BASE: z.string().url(),
  RPC_BASE: z.string().url(),
  RPC_OPTIMISM: z.string().url(),
  RPC_UNICHAIN: z.string().url(),
  ENTRYPOINT_UNICHAIN: z.string().transform((x) => getAddress(x)),
  ENTRYPOINT_OPTIMISM: z.string().transform((x) => getAddress(x)),
  ENTRYPOINT_BASE: z.string().transform((x) => getAddress(x)),
  EXPLORER_BASE: z.string().url(),
  EXPLORER_OPTIMISM: z.string().url(),
  EXPLORER_UNICHAIN: z.string().url(),
  SUPERCHAIN_POINTS_ADDRESS: z.string().startsWith("0x"),
  SUPERCHAIN_BADGES_ADDRESS: z.string().startsWith("0x"),
  SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS: z.string().startsWith("0x"),
  WALLET_CONNECT_PROJECT_ID: z.string(),
});

const envParsed = () => envSchema.parse(env);

export default envParsed;
