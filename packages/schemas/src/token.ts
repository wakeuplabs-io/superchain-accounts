import { isAddress } from "viem";
import { z } from "zod";

export const addTokenRequestSchema = z.object({
  address: z
    .string({
      required_error: "Contract address is required",
      invalid_type_error: "Invalid contract address",
    })
    .refine((val) => isAddress(val), "Invalid contract address"),
});

export type AddTokenRequest = z.infer<typeof addTokenRequestSchema>

const tokenSchema = z.object({
  address: z.string().refine((val) => isAddress(val)),
  name: z.string(),
  symbol: z.string(),
  logo: z.string().optional(),
});

export type Token = z.infer<typeof tokenSchema>;