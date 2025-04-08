import { db } from "@/database/client";
import { PointsEventsService } from "@/services/points-events";
import { Router } from "express";

const router = Router();

const pointsEventsService = new PointsEventsService(db, []);

router.get("/:address", async (req, res) => {
  const address = req.params.address;

  const pointsEvents = await pointsEventsService.getUserPoints(address);

  res.send({ data: { points: pointsEvents } });
});

export default router;
