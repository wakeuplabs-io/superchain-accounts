import { z } from "zod";

export const createRaffleBodySchema = z.object({
  chainId: z.coerce.number(),
  jackpot: z.coerce.number(),
  badges: z.array(z.coerce.bigint()),
  revealAfter: z.coerce.date(),
  badgeAllocations: z.array(z.coerce.bigint()),
});

export type CreateRaffleBody = z.infer<typeof createRaffleBodySchema>;