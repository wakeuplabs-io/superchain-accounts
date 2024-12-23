import { z } from "zod";

// NOTE: DO NOT destructure process.env

const env = {
  APP_URL: import.meta.env.APP_URL,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
};

const envSchema = z
  .object({
    APP_URL: z.string().url().optional().default("http://localhost:5000"),
    DEV: z.boolean(),
    PROD: z.boolean(),
  })
  .required();

const envParsed = () => envSchema.parse(env);

export default envParsed;
