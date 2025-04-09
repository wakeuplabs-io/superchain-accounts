import envParsed from "@/envParsed";
import { IPointsEventsService } from "@/services/points-events";
import { Router } from "express";

export default function createRoutes(
  pointsEventsService: IPointsEventsService
): Router {
  const router = Router();

  router.post("/submit", async (req, res) => {
    // verify api key
    if (req.headers["x-cron-key"] !== envParsed().CRONJOB_KEY) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    await pointsEventsService.submit();
  });

  router.get("/:address", async (req, res) => {
    const address = req.params.address;
    const chainId = req.query.chainId as string;
    const limit = req.query.limit;

    const pointsEvents = await pointsEventsService.getUserPoints(address, {
      chainId,
      limit: limit ? Number(limit) : undefined,
    });

    res.send({ data: { points: pointsEvents } });
  });

  return router;
}
