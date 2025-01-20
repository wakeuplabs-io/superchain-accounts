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
  TIMEFRAME_EVENTS_TABLE: process.env.TIMEFRAME_EVENTS_TABLE,
} as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.string().default("5000"),
    EVENTS_TABLE: z
      .string()
      .default("superchain-accounts-api-events-development-table"),
    USERS_TABLE: z
      .string()
      .default("superchain-accounts-api-users-development-table"),
    MILESTONES_TABLE: z
      .string()
      .default("superchain-accounts-api-milestones-development-table"),
    REWARDS_TABLE: z
      .string()
      .default("superchain-accounts-api-rewards-development-table"),
    EVENTS_DEF_TABLE: z
      .string()
      .default("superchain-accounts-api-events-def-development-table"),
    MILESTONES_DEF_TABLE: z
      .string()
      .default("superchain-accounts-api-milestones-def-development-table"),
    REWARDS_DEF_TABLE: z
      .string()
      .default("superchain-accounts-api-rewards-def-development-table"),
    TIMEFRAME_EVENTS_TABLE: z
      .string()
      .default("superchain-accounts-api-timeframe-development-table"),
    PAYMASTER_ADDRESS: z.string().transform((str) => getAddress(str)),
  })
  .required();

type Env = z.infer<typeof envSchema>;

const envParsed = (): Env => envSchema.parse(env);

export default envParsed;
