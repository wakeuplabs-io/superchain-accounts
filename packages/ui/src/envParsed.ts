import { getAddress } from "viem";
import { z } from "zod";

// NOTE: DO NOT destructure process.env

console.log(import.meta.env.VITE_LOCAL_DEV);

const env = {
  APP_URL: import.meta.env.APP_URL,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  API_URL: import.meta.env.VITE_API_URL,
  BUNDLER_UNICHAIN_SEPOLIA: import.meta.env.VITE_BUNDLER_UNICHAIN_SEPOLIA,
  BUNDLER_OPTIMISM_SEPOLIA: import.meta.env.VITE_BUNDLER_OPTIMISM_SEPOLIA,
  BUNDLER_BASE_SEPOLIA: import.meta.env.VITE_BUNDLER_BASE_SEPOLIA,
  RPC_BASE_SEPOLIA: import.meta.env.VITE_RPC_BASE_SEPOLIA,
  RPC_OPTIMISM_SEPOLIA: import.meta.env.VITE_RPC_OPTIMISM_SEPOLIA,
  RPC_UNICHAIN_SEPOLIA: import.meta.env.VITE_RPC_UNICHAIN_SEPOLIA,
  ENTRYPOINT_UNICHAIN_SEPOLIA: import.meta.env.VITE_ENTRYPOINT_UNICHAIN_SEPOLIA,
  ENTRYPOINT_OPTIMISM_SEPOLIA: import.meta.env.VITE_ENTRYPOINT_OPTIMISM_SEPOLIA,
  ENTRYPOINT_BASE_SEPOLIA: import.meta.env.VITE_ENTRYPOINT_BASE_SEPOLIA,
  EXPLORER_BASE_SEPOLIA: import.meta.env.VITE_EXPLORER_BASE_SEPOLIA,
  EXPLORER_OPTIMISM_SEPOLIA: import.meta.env.VITE_EXPLORER_OPTIMISM_SEPOLIA,
  EXPLORER_UNICHAIN_SEPOLIA: import.meta.env.VITE_EXPLORER_UNICHAIN_SEPOLIA,
  SUPERCHAIN_POINTS_ADDRESS: import.meta.env.VITE_SUPERCHAIN_POINTS_ADDRESS,
  SUPERCHAIN_BADGES_ADDRESS: import.meta.env.VITE_SUPERCHAIN_BADGES_ADDRESS,
  SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS: import.meta.env.VITE_SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS,
};

const envSchema = z
  .object({
    APP_URL: z.string().url().optional().default("http://localhost:5000"),
    DEV: z.boolean(),
    PROD: z.boolean(),
    API_URL: z.string().url(),
    BUNDLER_UNICHAIN_SEPOLIA: z.string().url(),
    BUNDLER_OPTIMISM_SEPOLIA: z.string().url(),
    BUNDLER_BASE_SEPOLIA: z.string().url(),
    RPC_BASE_SEPOLIA: z.string().url(),
    RPC_OPTIMISM_SEPOLIA: z.string().url(),
    RPC_UNICHAIN_SEPOLIA: z.string().url(),
    ENTRYPOINT_UNICHAIN_SEPOLIA: z.string().transform((x) => getAddress(x)),
    ENTRYPOINT_OPTIMISM_SEPOLIA: z.string().transform((x) => getAddress(x)),
    ENTRYPOINT_BASE_SEPOLIA: z.string().transform((x) => getAddress(x)),
    EXPLORER_BASE_SEPOLIA: z.string().url(),
    EXPLORER_OPTIMISM_SEPOLIA: z.string().url(),
    EXPLORER_UNICHAIN_SEPOLIA: z.string().url(),
    SUPERCHAIN_POINTS_RAFFLE_FACTORY_ADDRESS: z.string().startsWith("0x"),
    SUPERCHAIN_POINTS_ADDRESS: z.string().startsWith("0x"),
    SUPERCHAIN_BADGES_ADDRESS: z.string().startsWith("0x"),
  });

const envParsed = () => envSchema.parse(env);

export default envParsed;
