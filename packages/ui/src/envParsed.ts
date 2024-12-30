import { getAddress } from "viem";
import { z } from "zod";

// NOTE: DO NOT destructure process.env

console.log(import.meta.env.VITE_LOCAL_DEV);

const env = {
  APP_URL: import.meta.env.APP_URL,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  LOCAL_DEV: import.meta.env.VITE_LOCAL_DEV,
  LOCAL_CHAIN_ID: import.meta.env.VITE_LOCAL_CHAIN_ID,
  LOCAL_CHAIN_NAME: import.meta.env.VITE_LOCAL_CHAIN_NAME,
  LOCAL_RPC_URL: import.meta.env.VITE_LOCAL_RPC_URL,
  BUNDLER_URL: import.meta.env.VITE_BUNDLER_URL,
  PAYMASTER_CLIENT_URL: import.meta.env.VITE_PAYMASTER_CLIENT_URL,
  ENTRYPOINT_ADDRESS: import.meta.env.VITE_ENTRYPOINT_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS: import.meta.env.VITE_SMART_ACCOUNT_FACTORY_ADDRESS,
};

const envSchema = z
  .object({
    APP_URL: z.string().url().optional().default("http://localhost:5000"),
    DEV: z.boolean(),
    PROD: z.boolean(),
    LOCAL_DEV: z.string().optional().default("false").transform((x) => x === "true"),
    LOCAL_CHAIN_ID: z.string().optional().transform((x) => Number(x)),
    LOCAL_CHAIN_NAME: z.string().optional(),
    LOCAL_RPC_URL: z.string().optional(),
    BUNDLER_URL: z.string().url(),
    PAYMASTER_CLIENT_URL: z.string().url(),
    ENTRYPOINT_ADDRESS: z.string().transform((x) => getAddress(x)),
    SMART_ACCOUNT_FACTORY_ADDRESS: z.string().transform((x) => getAddress(x)),
  });

const envParsed = () => envSchema.parse(env);

export default envParsed;
