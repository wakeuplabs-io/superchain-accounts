import { z } from "zod";
import dotenv from "dotenv";
import { getAddress } from "viem";

dotenv.config();

// NOTE: DO NOT destructure process.env

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  PAYMASTER_ADDRESS: process.env.PAYMASTER_ADDRESS,
  EVENTS_TABLE: process.env.EVENTS_TABLE,
  USERS_TABLE: process.env.USERS_TABLE,
  MILESTONES_TABLE: process.env.MILESTONES_TABLE,
  REWARDS_TABLE: process.env.REWARDS_TABLE,
  EVENTS_DEF_TABLE: process.env.EVENTS_DEF_TABLE,
  MILESTONES_DEF_TABLE: process.env.MILESTONES_DEF_TABLE,
  REWARDS_DEF_TABLE: process.env.REWARDS_DEF_TABLE,
  BUNDLER_UNICHAIN_SEPOLIA: process.env.BUNDLER_UNICHAIN_SEPOLIA,
  BUNDLER_OPTIMISM_SEPOLIA: process.env.BUNDLER_OPTIMISM_SEPOLIA,
  BUNDLER_BASE_SEPOLIA: process.env.BUNDLER_BASE_SEPOLIA,
  RPC_UNICHAIN_SEPOLIA: process.env.RPC_UNICHAIN_SEPOLIA,
  RPC_OPTIMISM_SEPOLIA: process.env.RPC_OPTIMISM_SEPOLIA,
  RPC_BASE_SEPOLIA: process.env.RPC_BASE_SEPOLIA,
} as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.string().default("5000"),
    EVENTS_TABLE: z.string().default("events-staging-table"),
    USERS_TABLE: z.string().default("users-staging-table"),
    MILESTONES_TABLE: z.string().default("milestones-staging-table"),
    REWARDS_TABLE: z.string().default("rewards-staging-table"),
    EVENTS_DEF_TABLE: z.string().default("events-def-staging-table"),
    MILESTONES_DEF_TABLE: z.string().default("milestones-def-staging-table"),
    REWARDS_DEF_TABLE: z.string().default("rewards-def-staging-table"),
    PAYMASTER_ADDRESS: z.string().transform((str) => getAddress(str)),
    BUNDLER_UNICHAIN_SEPOLIA: z.string(),
    BUNDLER_OPTIMISM_SEPOLIA: z.string(),
    BUNDLER_BASE_SEPOLIA: z.string(),
    RPC_UNICHAIN_SEPOLIA: z.string(),
    RPC_OPTIMISM_SEPOLIA: z.string(),
    RPC_BASE_SEPOLIA: z.string(),
  })
  .required();

type Env = z.infer<typeof envSchema>;

const envParsed = (): Env => envSchema.parse(env);

export default envParsed;
