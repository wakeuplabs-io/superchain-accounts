import { isAddress } from "viem";
import { z } from "zod";

export const importUserTokenRequestSchema = z.object({
  chainId: z.number({required_error: "Chain is required"}),
  userAddress:  z
    .string({
      required_error: "User address is required",
    })
    .refine((val) => isAddress(val), "Invalid user address"),
  address: z
    .string({
      required_error: "Contract address is required",
    })
    .refine((val) => isAddress(val), "Invalid contract address"),
});

export type ImportUserTokenRequest = z.infer<typeof importUserTokenRequestSchema>

const userTokenSchema = z.object({
  address: z.string().refine((val) => isAddress(val)),
  userAddress: z.string().refine((val) => isAddress(val)),
  chainId: z.number(),
  name: z.string(),
  symbol: z.string(),
  logo: z.string().optional(),
});

export type UserToken = z.infer<typeof userTokenSchema>;