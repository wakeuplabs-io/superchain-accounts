import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const params = {
      TableName: process.env.USERS_TABLE || "Users-Staging",
      Key: {
        PK: `USER#${userId}`,
        SK: "PROFILE",
      },
    };

    try {
      const data = await dynamoDb.get(params).promise();
      if (!data.Item) {
        res.status(404).send({ message: "User not found" });
      }
      res.send(data.Item);
    } catch (error) {
      res.status(500);
    }
  }
);

export default router;
