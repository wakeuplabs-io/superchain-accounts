import { z } from "zod";
import dotenv from "dotenv";
import { getAddress } from "viem";

dotenv.config();

// NOTE: DO NOT destructure process.env

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  PAYMASTER_ADDRESS: process.env.PAYMASTER_ADDRESS,
};

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    PORT: z.string().default("5000"),
    PAYMASTER_ADDRESS: z.string().transform((str) => getAddress(str)),
  })
  .required();

const envParsed = () => envSchema.parse(env);

export default envParsed;
