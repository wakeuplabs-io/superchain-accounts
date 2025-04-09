import { IPointsEventsService } from "@/services/points-events";
import { Router } from "express";

export default function createRoutes(
  pointsEventsService: IPointsEventsService
): Router {
  const router = Router();

  router.post("/submit", async (req, res) => {
    // TODO:
    await pointsEventsService.submit();
  });

  router.get("/:address", async (req, res) => {
    const address = req.params.address;

    const pointsEvents = await pointsEventsService.getUserPoints(address);

    res.send({ data: { points: pointsEvents } });
  });

  return router;
}
