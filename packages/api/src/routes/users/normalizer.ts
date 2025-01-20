import { isAddress, Address } from "viem";
import { z } from "zod";

const requiredAddress = z
  .string()
  .refine((x) => isAddress(x, { strict: false }), {
    message: "ADDRESS_INVALID",
  })
  .transform((x) => x as Address);

const CreateAccountEventSchema = z.object({
  email: z.string(),
  smartAccount: requiredAddress,
  networks: z.array(z.object({ chain: z.string(), address: requiredAddress })),
  name: z.string(),
});

export const normalizeCreateAccount = (event: any) =>
  CreateAccountEventSchema.parse(event);
