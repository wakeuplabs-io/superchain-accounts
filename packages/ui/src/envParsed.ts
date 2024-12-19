import { z } from "zod";

// NOTE: DO NOT destructure process.env

const env = {
  APP_URL: import.meta.env.APP_URL,
  ENVIRONMENT: import.meta.env.ENVIRONMENT ?? "staging",
};

const envSchema = z
  .object({
    APP_URL: z.string().url().optional().default("http://localhost:5000"),
    ENVIRONMENT: z.enum(["staging", "production"]),
  })
  .required();

const envParsed = () => envSchema.parse(env);

export default envParsed;
