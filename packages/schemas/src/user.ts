import { isAddress } from "viem";
import { z } from "zod";

export const userWalletSchema = z.string().min(1, "Wallet address is required").refine((value) => isAddress(value), {
  message: "Wallet address is invalid",
});

export const profileSchema = z.object({
  rank: z.string(),
  position: z.object({
    current: z.number(),
    total: z.number(),
    percentile: z.number(),
  })
});

export type Profile = z.infer<typeof profileSchema>;