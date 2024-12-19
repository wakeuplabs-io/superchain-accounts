import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import envParsed from "@/envParsed.js";
import { normalizeCreateOrUpdateMilestone } from "../normalizer.js";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    normalizeCreateOrUpdateMilestone(req.body);
  } catch (e) {
    res.status(400).send({ message: "Invalid event" });
    return;
  }
  const milestone = normalizeCreateOrUpdateMilestone(req.body);
  const { milestone_type } = milestone;
  const params = {
    TableName: envParsed().MILESTONES_DEF_TABLE,
    Item: {
      PK: `MILESTONE_DEFINITION#${milestone_type}`,
      SK: "DEFINITION",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...milestone,
    },
  };
  try {
    await dynamoDb.put(params).promise();
    res.send({ message: "Milestone created", code: 201 });
  } catch (error) {
    res.status(500).send({ message: "Error creating event" });
  }
});

router.patch("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    normalizeCreateOrUpdateMilestone(req.body);
  } catch (e) {
    res.status(400).send({ message: "Invalid event" });
    return;
  }

  const milestone = normalizeCreateOrUpdateMilestone(req.body);
  const { milestone_type } = milestone;

  const params = {
    TableName: envParsed().MILESTONES_DEF_TABLE,
    Key: {
      PK: `MILESTONE_DEFINITION#${milestone_type}`,
      SK: "DEFINITION",
    },
    UpdateExpression: `SET 
          #updated_at = :updated_at,
          ${Object.keys(milestone)
            .map((key, index) => `#${key} = :value${index}`)
            .join(", ")}`,
    ExpressionAttributeNames: {
      "#updated_at": "updated_at",
      ...Object.keys(milestone).reduce(
        (acc, key, index) => ({
          ...acc,
          [`#${key}`]: key,
        }),
        {},
      ),
    },
    ExpressionAttributeValues: {
      ":updated_at": new Date().toISOString(),
      ...Object.keys(milestone).reduce(
        (acc, key, index) => ({
          ...acc,
          [`:value${index}`]: milestone[key as keyof typeof milestone],
        }),
        {} as { [key: string]: any },
      ),
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await dynamoDb.update(params).promise();
    res.send({
      message: "Event updated successfully",
      updatedAttributes: result.Attributes,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).send({ message: "Error updating event" });
  }
});

export default router;
