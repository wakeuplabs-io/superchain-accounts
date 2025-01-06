import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import envParsed from "@/envParsed.js";
import mappingRoute from "./mapping/route.js";
import { normalizeCryptoEvent } from "./normalizer.js";
import { calculatePoints } from "@/domain/points.js";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.use("/mapping", mappingRoute);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    normalizeCryptoEvent(req.body);
  } catch (error) {
    res
      .status(400)
      .send({ message: "Invalid event", reason: JSON.stringify(error) });
    return;
  }
  const event = normalizeCryptoEvent(req.body);
  const { eventType, chain, eventDate, address } = event;
  const points_awarded = calculatePoints(event);
  console.log("points_awarded", points_awarded);
  console.log("event", event);
  //@todo calculate rewards and milestones in a module and call it here
  const params = {
    TransactItems: [
      {
        Put: {
          TableName: envParsed().EVENTS_TABLE,
          Item: {
            PK: `EVENT#${address}`,
            SK: `TIMESTAMP#${eventDate}`,
            event_type: eventType,
            chain,
            points_awarded,
            data: { ...event.args }, //metadata
            created_at: new Date().toISOString(),
          },
        },
      },
      {
        Update: {
          TableName: envParsed().USERS_TABLE,
          Key: {
            PK: `USER#${address}`,
            SK: `PROFILE`,
          },
          UpdateExpression: "ADD #points :incrementValue",
          ExpressionAttributeNames: {
            "#points": "superchain_points",
          },
          ExpressionAttributeValues: {
            ":incrementValue": points_awarded,
          },
          ReturnValues: "UPDATED_NEW",
        },
      },
    ],
  };
  try {
    await dynamoDb.transactWrite(params).promise();
    res.send({ message: "Event created", code: 201 });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating event", reason: JSON.stringify(error) });
  }
});

export default router;
