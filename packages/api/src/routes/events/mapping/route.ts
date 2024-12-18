import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import envParsed from "@/envParsed.js";
import { normalizeCreateOrUpdateEvent } from "../normalizer.js";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    normalizeCreateOrUpdateEvent(req.body);
  } catch (error) {
    res.status(400).send({ message: "Invalid event" });
    return;
  }
  const event: { [key: string]: any } = normalizeCreateOrUpdateEvent(req.body);

  const { event_type } = event;

  const params = {
    TableName: envParsed().EVENTS_DEF_TABLE,
    Item: {
      PK: `EVENT_DEFINITION#${event_type}`,
      SK: "DEFINITION",
      ...event,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  try {
    await dynamoDb.put(params).promise();
    res.send({ message: "Event created", code: 201 });
  } catch (error) {
    res.status(500).send({ message: "Error creating event" });
  }
});

router.patch("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    normalizeCreateOrUpdateEvent(req.body);
  } catch (error) {
    res.status(400).send({ message: "Invalid event" });
    return;
  }

  const event: { [key: string]: any } = normalizeCreateOrUpdateEvent(req.body);
  const { event_type } = event;

  const params = {
    TableName: envParsed().EVENTS_DEF_TABLE,
    Key: {
      PK: `EVENT_DEFINITION#${event_type}`,
      SK: "DEFINITION",
    },
    UpdateExpression: `SET 
        #updated_at = :updated_at,
        ${Object.keys(event)
          .map((key, index) => `#${key} = :value${index}`)
          .join(", ")}`,
    ExpressionAttributeNames: {
      "#updated_at": "updated_at",
      ...Object.keys(event).reduce(
        (acc, key, index) => ({
          ...acc,
          [`#${key}`]: key,
        }),
        {}
      ),
    },
    ExpressionAttributeValues: {
      ":updated_at": new Date().toISOString(),
      ...Object.keys(event).reduce(
        (acc, key, index) => ({
          ...acc,
          [`:value${index}`]: event[key],
        }),
        {}
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
