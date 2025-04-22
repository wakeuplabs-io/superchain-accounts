import { z } from "zod";

export const GetPointsParams = z.object({
  address: z.string().min(1, "Address is required").startsWith("0x"),
});

export const GetPointsQuery = z.object({
  chainId: z.string().optional(),
  limit: z
    .string()
    .transform(Number)
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "limit must be a positive integer",
    })
    .optional(),
});

export const claimPointsBodySchema = z.array(
  z.coerce.number()
).min(1, "Addresses are required");

export type ClaimPointsBody = z.infer<typeof claimPointsBodySchema>;