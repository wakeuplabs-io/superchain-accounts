import { z } from "zod";
import "dotenv/config";

// NOTE: DO NOT destructure process.env

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  BUNDLER_UNICHAIN_SEPOLIA: process.env.BUNDLER_UNICHAIN_SEPOLIA,
  BUNDLER_OPTIMISM_SEPOLIA: process.env.BUNDLER_OPTIMISM_SEPOLIA,
  BUNDLER_BASE_SEPOLIA: process.env.BUNDLER_BASE_SEPOLIA,
  RPC_UNICHAIN_SEPOLIA: process.env.RPC_UNICHAIN_SEPOLIA,
  RPC_OPTIMISM_SEPOLIA: process.env.RPC_OPTIMISM_SEPOLIA,
  RPC_BASE_SEPOLIA: process.env.RPC_BASE_SEPOLIA,
  ENTRYPOINT_UNICHAIN_SEPOLIA: process.env.ENTRYPOINT_UNICHAIN_SEPOLIA,
  ENTRYPOINT_OPTIMISM_SEPOLIA: process.env.ENTRYPOINT_OPTIMISM_SEPOLIA,
  ENTRYPOINT_BASE_SEPOLIA: process.env.ENTRYPOINT_BASE_SEPOLIA,
  DATABASE_URL: process.env.DATABASE_URL,
  OWNER_PRIVATE_KEY: process.env.OWNER_PRIVATE_KEY,
  SUPERCHAIN_BADGES_ADDRESS: process.env.SUPERCHAIN_BADGES_ADDRESS,
  SUPERCHAIN_POINTS_ADDRESS: process.env.SUPERCHAIN_POINTS_ADDRESS,
  CRONJOB_KEY: process.env.CRONJOB_KEY,
  MULTICALL_CONTRACT_ADDRESS: process.env.MULTICALL_CONTRACT_ADDRESS,
} as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.string().default("5000"),
    BUNDLER_UNICHAIN_SEPOLIA: z.string(),
    BUNDLER_OPTIMISM_SEPOLIA: z.string(),
    BUNDLER_BASE_SEPOLIA: z.string(),
    RPC_UNICHAIN_SEPOLIA: z.string(),
    RPC_OPTIMISM_SEPOLIA: z.string(),
    RPC_BASE_SEPOLIA: z.string(),
    ENTRYPOINT_UNICHAIN_SEPOLIA: z.string(),
    ENTRYPOINT_OPTIMISM_SEPOLIA: z.string(),
    ENTRYPOINT_BASE_SEPOLIA: z.string(),
    DATABASE_URL: z.string(),
    OWNER_PRIVATE_KEY: z.string().startsWith("0x"),
    SUPERCHAIN_BADGES_ADDRESS: z.string().startsWith("0x"),
    SUPERCHAIN_POINTS_ADDRESS: z.string().startsWith("0x"),
    CRONJOB_KEY: z.string(),
    MULTICALL_CONTRACT_ADDRESS: z.string().startsWith("0x"),
  })
  .required();

type Env = z.infer<typeof envSchema>;

const envParsed = (): Env => envSchema.parse(env);

export default envParsed;
