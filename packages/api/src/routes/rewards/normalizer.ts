import { z } from "zod";

const CreateOrUpdateRewardsSchema = z.object({
  reward_type: z.string(),
  reward_name: z.string(),
  reward_description: z.string(),
  reward_target: z.number(),
  reward_value: z.number(),
  active: z.boolean(),
});

export const normalizeCreateOrUpdateRewards = (payload: any) =>
  CreateOrUpdateRewardsSchema.parse(payload);
