import { z } from "zod";
import "dotenv/config";

// NOTE: DO NOT destructure process.env

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  BUNDLER_UNICHAIN:
    process.env.BUNDLER_UNICHAIN || process.env.BUNDLER_UNICHAIN_SEPOLIA,
  BUNDLER_OPTIMISM:
    process.env.BUNDLER_OPTIMISM || process.env.BUNDLER_OPTIMISM_SEPOLIA,
  BUNDLER_BASE: process.env.BUNDLER_BASE || process.env.BUNDLER_BASE_SEPOLIA,
  RPC_UNICHAIN: process.env.RPC_UNICHAIN || process.env.RPC_UNICHAIN_SEPOLIA,
  RPC_OPTIMISM: process.env.RPC_OPTIMISM || process.env.RPC_OPTIMISM_SEPOLIA,
  RPC_BASE: process.env.RPC_BASE || process.env.RPC_BASE_SEPOLIA,
  ENTRYPOINT_UNICHAIN:
    process.env.ENTRYPOINT_UNICHAIN || process.env.ENTRYPOINT_UNICHAIN_SEPOLIA,
  ENTRYPOINT_OPTIMISM:
    process.env.ENTRYPOINT_OPTIMISM || process.env.ENTRYPOINT_OPTIMISM_SEPOLIA,
  ENTRYPOINT_BASE:
    process.env.ENTRYPOINT_BASE || process.env.ENTRYPOINT_BASE_SEPOLIA,
  DATABASE_URL: process.env.DATABASE_URL,
  OWNER_PRIVATE_KEY: process.env.OWNER_PRIVATE_KEY,
  SUPERCHAIN_BADGES_ADDRESS: process.env.SUPERCHAIN_BADGES_ADDRESS,
  SUPERCHAIN_POINTS_ADDRESS: process.env.SUPERCHAIN_POINTS_ADDRESS,
  CRONJOB_KEY: process.env.CRONJOB_KEY,
  MULTICALL_CONTRACT_ADDRESS: process.env.MULTICALL_CONTRACT_ADDRESS,
  AAVE_CONTRACT_ADDRESS_UNICHAIN: process.env.AAVE_CONTRACT_ADDRESS_UNICHAIN,
  AAVE_CONTRACT_ADDRESS_OPTIMISM: process.env.AAVE_CONTRACT_ADDRESS_OPTIMISM,
  AAVE_CONTRACT_ADDRESS_BASE: process.env.AAVE_CONTRACT_ADDRESS_BASE,
} as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.string().default("5000"),
    BUNDLER_UNICHAIN: z.string(),
    BUNDLER_OPTIMISM: z.string(),
    BUNDLER_BASE: z.string(),
    RPC_UNICHAIN: z.string(),
    RPC_OPTIMISM: z.string(),
    RPC_BASE: z.string(),
    ENTRYPOINT_UNICHAIN: z.string(),
    ENTRYPOINT_OPTIMISM: z.string(),
    ENTRYPOINT_BASE: z.string(),
    DATABASE_URL: z.string(),
    OWNER_PRIVATE_KEY: z.string().startsWith("0x"),
    SUPERCHAIN_BADGES_ADDRESS: z.string().startsWith("0x"),
    SUPERCHAIN_POINTS_ADDRESS: z.string().startsWith("0x"),
    CRONJOB_KEY: z.string(),
    MULTICALL_CONTRACT_ADDRESS: z.string().startsWith("0x"),
    AAVE_CONTRACT_ADDRESS_UNICHAIN: z.string().startsWith("0x"),
    AAVE_CONTRACT_ADDRESS_OPTIMISM: z.string().startsWith("0x"),
    AAVE_CONTRACT_ADDRESS_BASE: z.string().startsWith("0x"),
  })
  .required();

type Env = z.infer<typeof envSchema>;

const envParsed = (): Env => envSchema.parse(env);

export default envParsed;
