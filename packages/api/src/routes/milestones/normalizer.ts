import { z } from "zod";

const CreateOrUpdateMilestoneSchema = z.object({
  milestone_type: z.string(),
  milestone_name: z.string(),
  milestone_description: z.string(),
  milestone_target: z.number(),
  reward_type: z.string(),
  active: z.boolean(),
});

export const normalizeCreateOrUpdateMilestone = (payload: any) =>
  CreateOrUpdateMilestoneSchema.parse(payload);
