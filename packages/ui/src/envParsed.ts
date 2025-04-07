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
  OPTIMISM_RPC_URL: import.meta.env.VITE_OPTIMISM_RPC_URL,
  OPTIMISM_PIMLICO_URL: import.meta.env.VITE_OPTIMISM_PIMLICO_URL,
  OPTIMISM_ENTRYPOINT_ADDRESS: import.meta.env.VITE_OPTIMISM_ENTRYPOINT_ADDRESS,
  UNICHAIN_RPC_URL: import.meta.env.VITE_UNICHAIN_RPC_URL,
  UNICHAIN_PIMLICO_URL: import.meta.env.VITE_UNICHAIN_PIMLICO_URL,
  UNICHAIN_ENTRYPOINT_ADDRESS: import.meta.env.VITE_UNICHAIN_ENTRYPOINT_ADDRESS,
  BASE_RPC_URL: import.meta.env.VITE_BASE_RPC_URL,
  BASE_PIMLICO_URL: import.meta.env.VITE_BASE_PIMLICO_URL,
  BASE_ENTRYPOINT_ADDRESS: import.meta.env.VITE_BASE_ENTRYPOINT_ADDRESS,
  API_URL: import.meta.env.VITE_API_URL,
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
    OPTIMISM_RPC_URL: z.string().url(),
    OPTIMISM_PIMLICO_URL: z.string().url(),
    OPTIMISM_ENTRYPOINT_ADDRESS: z.string().transform((x) => getAddress(x)),
    UNICHAIN_RPC_URL: z.string().url(),
    UNICHAIN_PIMLICO_URL: z.string().url(),
    UNICHAIN_ENTRYPOINT_ADDRESS: z.string().transform((x) => getAddress(x)),
    BASE_RPC_URL: z.string().url(),
    BASE_PIMLICO_URL: z.string().url(),
    BASE_ENTRYPOINT_ADDRESS: z.string().transform((x) => getAddress(x)),
    API_URL: z.string().url(),
  });

const envParsed = () => envSchema.parse(env);

export default envParsed;
