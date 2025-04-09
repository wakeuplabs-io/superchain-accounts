import { IPointsEventsService } from "@/services/points-events";
import { Router } from "express";

export default function createRoutes(
  pointsEventsService: IPointsEventsService
): Router {
  const router = Router();

  router.post("/submit", async (req, res) => {
    // verify api key
    if (req.headers["x-api-key"] !== process.env.API_KEY) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    await pointsEventsService.submit();
  });

  router.get("/:address", async (req, res) => {
    const address = req.params.address;

    // TODO: filter by chain, and limit

    const pointsEvents = await pointsEventsService.getUserPoints(address);

    res.send({ data: { points: pointsEvents } });
  });

  return router;
}
