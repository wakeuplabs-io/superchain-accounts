import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import envParsed from "@/envParsed.js";
import { normalizeCreateAccount } from "./normalizer.js";
import { UserService } from "./service.js";
import { EventDefService } from "../events/mapping/service.js";
import { TimeframeEventsService } from "../events/service.js";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const router = Router();
const userService = new UserService(dynamoDb);
const eventDefService = new EventDefService(dynamoDb);
const timeframeService = new TimeframeEventsService(dynamoDb);

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
    const {
      smartAccount: address,
      name,
      email,
      networks,
    } = normalizeCreateAccount(req.body);
    try {
      const user = await userService.createUser(address, name, email, networks);
      console.log("User created", user);
      const timeframeEvents = await eventDefService.getAllEvents("timeframe");
      console.log("Timeframe events", timeframeEvents);
      await timeframeService.createTimeBasedEventsForUser(
        address,
        timeframeEvents
      );
      res.status(201).send(user);
    } catch (error) {
      res.status(500).send({ message: "Error creating user" });
    }
  }
);

export default router;
