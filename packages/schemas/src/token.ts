import { isAddress } from "viem";
import { z } from "zod";

export const getUserTokensRequestSchema = z.object({
  chainId: z.coerce.number().optional(),
  userWallet:  z
    .string({
      required_error: "User wallet is required",
    })
    .refine((val) => isAddress(val), "Invalid user address"),
});

export type GetUserTokensRequest = z.infer<typeof getUserTokensRequestSchema>;

export const importUserTokenRequestSchema = z.object({
  chainId: z.number({required_error: "Chain is required"}),
  userWallet:  z
    .string({
      required_error: "User wallet is required",
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
  id: z.number(),
  address: z.string().refine((val) => isAddress(val)),
  userWallet: z.string().refine((val) => isAddress(val)),
  chainId: z.number(),
  name: z.string(),
  symbol: z.string(),
  logo: z.string().optional(),
});

export type UserToken = z.infer<typeof userTokenSchema>;