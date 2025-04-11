import { isAddress } from "viem";
import { z } from "zod";

const userTokenSchema = z.object({
  id: z.number(),
  address: z.string().refine((val) => isAddress(val)),
  userWallet: z.string().refine((val) => isAddress(val)),
  decimals: z.number(),
  chainId: z.number(),
  name: z.string(),
  symbol: z.string(),
  logoURI: z.string().nullish(),
});

export type UserToken = z.infer<typeof userTokenSchema>;

export const getUserTokensRequestSchema = z.object({
  chainId: z.coerce.number(),
  userWallet:  z
    .string({
      required_error: "User wallet is required",
    })
    .refine((val) => isAddress(val), "Invalid user address"),
});

export type GetUserTokensRequest = z.infer<typeof getUserTokensRequestSchema>;

export const getUserTokensResponseScheme = z.array(userTokenSchema.extend({
  balance: z.coerce.bigint(),
})); 

export type GetUserTokensResponse = z.infer<typeof getUserTokensResponseScheme>;

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