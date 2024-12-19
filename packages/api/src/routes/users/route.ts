import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    console.log("UserId to lookup: ", userId);

    const params = {
      TableName: process.env.USERS_TABLE || "Users-Staging",
      Key: {
        PK: `USER#${userId}`, // Ensure the PK is correctly formatted
        SK: "PROFILE", // Include the SK as per the schema
      },
    };

    try {
      console.log("Params: ", params);
      const data = await dynamoDb.get(params).promise();
      console.log("Data: ", data);
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
