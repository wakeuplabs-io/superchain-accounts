import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";

import mappingRoute from "./mapping/route.js";
import { normalizeCryptoEvent } from "./normalizer.js";
import { UserService } from "../users/service.js";
import { EventDefService } from "./mapping/service.js";

import { EventService } from "./service.js";
import { EventType } from "@/domain/events/types.js";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const eventDefService = new EventDefService(dynamoDb);
const eventService = new EventService(dynamoDb);
const userService = new UserService(dynamoDb);

const router = Router();

router.use("/mapping", mappingRoute);

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    normalizeCryptoEvent(req.body);
  } catch (error) {
    res
      .status(400)
      .send({ message: "Invalid event", reason: JSON.stringify(error) });
  }
  const event = normalizeCryptoEvent(req.body);
  const { eventType, eventName, args } = event;
  if (args) {
    const { from: userAddress, ...rest } = args;
    console.log("event", event);

    try {
      const [user, eventDef] = await Promise.all([
        userService.getUserById(userAddress),
        eventDefService.getEventByID(eventName, eventType || EventType.Basic),
      ]);
      console.log("user", user);
      console.log("eventDef", eventDef);
      await eventService.processEvent(eventDef, userAddress);
      res.send({ message: "Event created", code: 201 });
    } catch (error) {
      res.status(500).send({
        message: "Error processing event",
        reason: JSON.stringify(error),
      });
    }
  } else {
    // Handle the case where args is undefined or null
    console.error("args is undefined or null");
    res.status(400).send({ message: "Invalid event" });
  }
});

export default router;
