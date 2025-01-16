import { EventType } from "@/domain/events/types.js";
import { EventDef, NormalizedCryptoEvent } from "@/types/index.js";
import { isAddress, Address } from "viem";
import { z } from "zod";

const requiredAddress = z
  .string()
  .refine((x) => isAddress(x), { message: "ADDRESS_INVALID" })
  .transform((x) => x as Address);

const NormalizedCryptoEventSchema = z.object({
  transactionHash: z.string(),
  eventName: z.string(),
  eventType: z.string().default(EventType.Basic),
  blockNumber: z.string(),
  eventKey: z.string(),
  eventDate: z.number(),
  address: requiredAddress,
  endpointUrl: z.string(),
  args: z.object({
    from: z.string(),
    to: z.string(),
    value: z.string(),
  }),
}) satisfies z.ZodType<NormalizedCryptoEvent>;

export const normalizeCryptoEvent = (body: {
  message: NormalizedCryptoEvent;
}): NormalizedCryptoEvent => NormalizedCryptoEventSchema.parse(body.message);

const CreateOrUpdateEventSchema = z.object({
  event_type: z.nativeEnum(EventType),
  event_trigger_type: z.enum(["blockchain", "timeframe"]),
  expires_on_ttl: z.optional(z.number()),
  event_name: z.string(),
  points_awarded: z.number(),
  description: z.string(),
  active: z.boolean(),
}) satisfies z.ZodType<EventDef>;

export const normalizeCreateOrUpdateEvent = (event: EventDef): EventDef => {
  return CreateOrUpdateEventSchema.parse(event);
};
