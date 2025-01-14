import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import envParsed from "@/envParsed.js";
import { normalizeCreateAccount } from "./normalizer.js";
import { UserService } from "./service.js";
import { EventDefService } from "../events/mapping/service.js";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const router = Router();
const userService = new UserService(dynamoDb);
const eventDefService = new EventDefService(dynamoDb);

router.get(
  "/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getUserById(req.params.address);
      res.send(user);
    } catch (error) {
      res.send(404).send({ message: "User not found" });
    }
  }
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
    const { address, name, email } = normalizeCreateAccount(req.body);
    try {
      const user = await userService.createUser(address, name, email);
      const timeframeEvents = await eventDefService.getAllEvents("timeframe");
      console.log("Timeframe events", timeframeEvents);
      res.status(201).send(user);
    } catch (error) {
      res.status(500).send({ message: "Error creating user" });
    }
  }
);

export default router;
