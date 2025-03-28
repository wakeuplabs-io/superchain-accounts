import { z } from "zod";
import dotenv from "dotenv";
import { Address } from "viem";
import { Networks } from "./networks";

dotenv.config();

const env = {
  NETWORK_TESTNET: process.env.NETWORK_TESTNET,
  NETWORK_MAINNET: process.env.NETWORK_MAINNET,
  TESTNET_PRIVATE_KEY: process.env.TESTNET_PRIVATE_KEY,
  MAINNET_PRIVATE_KEY: process.env.MAINNET_PRIVATE_KEY,
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY,
  LOCAL_CHAIN_ID: process.env.LOCAL_CHAIN_ID,
  LOCAL_CHAIN_NAME: process.env.LOCAL_CHAIN_NAME,
  LOCAL_RPC_URL: process.env.LOCAL_RPC_URL,
  LOCAL_PRIVATE_KEY: process.env.LOCAL_PRIVATE_KEY,
};

const envSchema = z
  .object({
    NETWORK_TESTNET: z.string().transform((x) => x as Networks),
    NETWORK_MAINNET: z.string().transform((x) => x as Networks),
    TESTNET_PRIVATE_KEY: z.string().transform((x) => x as Address),
    MAINNET_PRIVATE_KEY: z.string().transform((x) => x as Address),
    ETHERSCAN_API_KEY: z.string().transform((x) => x as Address),
    LOCAL_CHAIN_ID: z.string().optional().transform((x) => Number(x)),
    LOCAL_CHAIN_NAME: z.string().optional(),
    LOCAL_RPC_URL: z.string().optional(),
    LOCAL_PRIVATE_KEY: z.string().optional().transform((x) => x as Address)
  });

const envParsed = () => envSchema.parse(env);

export default envParsed;
