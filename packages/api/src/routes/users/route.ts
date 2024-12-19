import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import envParsed from "@/envParsed.js";
import { normalizeCreateAccount } from "./normalizer.js";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const router = Router();

router.get(
  "/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = `USER#${req.params.address}`;
    const params = {
      TableName: envParsed().USERS_TABLE,
      Key: {
        PK: userId,
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
  },
);

router.post(
  "/account",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      normalizeCreateAccount(req.body);
    } catch (e) {
      res.status(400).send({ message: "Invalid event" });
      return;
    }
    const payload = normalizeCreateAccount(req.body);
    const { address, name, email } = payload;
    const userId = `USER#${address}`;
    const params = {
      TableName: envParsed().USERS_TABLE,
      Item: {
        PK: userId,
        SK: "PROFILE",
        name,
        address,
        superchain_points: 0,
        email,
        nft_level: 1,
        created_at: new Date().toISOString(),
      },
    };

    try {
      await dynamoDb.put(params).promise();
      res.send({ message: "User created", code: 201 });
    } catch (error) {
      res.status(500).send({ message: "Error creating user" });
    }
  },
);

export default router;
