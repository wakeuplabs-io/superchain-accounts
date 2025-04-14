import { z } from "zod";

export const GetBadgesParams = z.object({
  address: z.string().min(1, "Address is required").startsWith("0x"),
});

export const GetBadgesQuery = z.object({
  chainId: z.string().optional(),
  limit: z
    .string()
    .transform(Number)
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "limit must be a positive integer",
    })
    .optional(),
});
