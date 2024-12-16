import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { userId, name, description, date } = req.body;

  const params = {
    TableName: process.env.REWARDS_DEF_TABLE || "table-name",
    Item: {
      PK: `USER#${userId}`,
      SK: `EVENT#${date}`,
      name,
      description,
      date,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    res.send({ message: "Event created" });
  } catch (error) {
    res.status(500).send({ message: "Error creating event" });
  }
});

router.patch(
  "/:eventId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, name, description, date } = req.body;
    const eventId = req.params.eventId;

    const params = {
      TableName: process.env.REWARDS_DEF_TABLE || "table-name",
      Key: {
        PK: `USER#${userId}`,
        SK: `EVENT#${eventId}`,
      },
      UpdateExpression:
        "set #name = :name, #description = :description, #date = :date",
      ExpressionAttributeNames: {
        "#name": "name",
        "#description": "description",
        "#date": "date",
      },
      ExpressionAttributeValues: {
        ":name": name,
        ":description": description,
        ":date": date,
      },
    };

    try {
      await dynamoDb.update(params).promise();
      res.send({ message: "Event updated" });
    } catch (error) {
      res.status(500).send({ message: "Error updating event" });
    }
  }
);

export default router;
