import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import envParsed from "@/envParsed.js";
import {
  normalizeAddNetwork,
  normalizeCreateAccount,
  normalizeImportTokens,
} from "./normalizer.js";
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
      res.status(404).send({ message: "User not found" });
    }
  }
);

router.post(
  "/tokens/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      normalizeImportTokens(req.body);
    } catch (e) {
      res.status(400).send({ message: "Invalid event", reason: e });
      return;
    }
    try {
      const { tokens } = normalizeImportTokens(req.body);
      const user = await userService.importTokens(req.params.address, tokens);
      res.send(user);
    } catch (error) {
      res.status(500).send({ error });
    }
  }
);

router.post(
  "/networks/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      normalizeAddNetwork(req.body);
    } catch (e) {
      res.status(400).send({ message: "Invalid event", reason: e });
      return;
    }
    try {
      const { networks } = normalizeAddNetwork(req.body);
      const user = await userService.addNetworks(req.params.address, networks);
      res.send(user);
    } catch (error) {
      res.status(500).send({ error });
    }
  }
);

router.post(
  "/account",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      normalizeCreateAccount(req.body);
    } catch (e) {
      res
        .status(400)
        .send({ message: "Invalid event", reason: JSON.stringify(e) });
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
      const events = await timeframeService.createTimeBasedEventsForUser(
        address,
        timeframeEvents
      );
      console.log("Timeframe events created", events);
      res.status(201).send(user);
    } catch (error) {
      res.status(500).send({ message: "Error creating user", reason: error });
    }
  }
);

export default router;
