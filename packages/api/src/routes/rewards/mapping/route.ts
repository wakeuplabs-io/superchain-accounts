import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import envParsed from "@/envParsed.js";
import { normalizeCreateOrUpdateRewards } from "../normalizer.js";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    normalizeCreateOrUpdateRewards(req.body);
  } catch (e) {
    res.status(400).send({ message: "Invalid event" });
    return;
  }
  const reward: { [key: string]: any } = normalizeCreateOrUpdateRewards(
    req.body
  );
  const { reward_type } = reward;

  const params = {
    TableName: envParsed().REWARDS_DEF_TABLE,
    Item: {
      PK: `REWARD_DEFINITION#${reward_type}`,
      SK: "DEFINITION",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...reward,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    res.send({ message: "Reward created", code: 201 });
  } catch (error) {
    res.status(500).send({ message: "Error creating reward" });
  }
});

router.patch("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    normalizeCreateOrUpdateRewards(req.body);
  } catch (e) {
    res.status(400).send({ message: "Invalid event" });
    return;
  }

  const reward: { [key: string]: any } = normalizeCreateOrUpdateRewards(
    req.body
  );
  const { reward_type } = reward;

  // Ensure the `reward_type` is provided
  if (!reward_type) {
    res.status(400).send({ message: "Missing reward_type" });
    return;
  }

  const params = {
    TableName: envParsed().REWARDS_DEF_TABLE,
    Key: {
      PK: `REWARD_DEFINITION#${reward_type}`,
      SK: "DEFINITION",
    },
    UpdateExpression: `SET 
          #updated_at = :updated_at,
          ${Object.keys(reward)
            .map((key, index) => `#${key} = :value${index}`)
            .join(", ")}`,
    ExpressionAttributeNames: {
      "#updated_at": "updated_at",
      ...Object.keys(reward).reduce(
        (acc, key, index) => ({
          ...acc,
          [`#${key}`]: key,
        }),
        {}
      ),
    },
    ExpressionAttributeValues: {
      ":updated_at": new Date().toISOString(),
      ...Object.keys(reward).reduce(
        (acc, key, index) => ({
          ...acc,
          [`:value${index}`]: reward[key],
        }),
        {}
      ),
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await dynamoDb.update(params).promise();
    res.send({
      message: "Reward updated successfully",
      updatedAttributes: result.Attributes,
    });
  } catch (error) {
    console.error("Error updating reward:", error);
    res.status(500).send({ message: "Error updating reward" });
  }
});

export default router;
