import { z } from "zod";

export const SetBadgeURIBody = z.object({
  chainId: z.string(),
  tokenId: z.string(), // Will be converted to bigint
  uri: z.string().url(),
});

export type SetBadgeURIRequest = z.infer<typeof SetBadgeURIBody>;
