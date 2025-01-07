import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import { normalizeCreateOrUpdateEvent } from "../normalizer.js";
import { EventDefService } from "./service.js";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const eventDefService = new EventDefService(dynamoDb);

const router = Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    normalizeCreateOrUpdateEvent(req.body);
  } catch (error) {
    res.status(400).send({ message: "Invalid event" });
    return;
  }
  const event = normalizeCreateOrUpdateEvent(req.body);

  try {
    await eventDefService.createEvent(event);
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

  const event = normalizeCreateOrUpdateEvent(req.body);

  try {
    const result = await eventDefService.updateEvent(event);
    res.send({
      message: "Event updated successfully",
      updatedAttributes: result.Attributes,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).send({ message: "Error updating event" });
  }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await eventDefService.getAllEvents();
    res.send(events);
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).send({ message: "Error getting events" });
  }
});


export default router;
