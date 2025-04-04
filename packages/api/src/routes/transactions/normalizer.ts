import { z } from "zod";

const SendUserOperationSchema = z.object({
  operation: z.any(),
  chainId: z.number(),
});

export const normalizeSendUserOperation = (event: any) =>
  SendUserOperationSchema.parse(event);
