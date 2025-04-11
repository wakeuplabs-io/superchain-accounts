import { IPointsEventsService } from "@/domain/points";
import { cronAuth } from "@/middlewares/cron-auth";
import { Router } from "express";
import { GetPointsParams, GetPointsQuery } from "schemas";

export default function createRoutes(
  pointsEventsService: IPointsEventsService
): Router {
  const router = Router();

  router.post("/submit", cronAuth, async (_, res) => {
    const transactions = await pointsEventsService.submit();

    res.send({ data: { transactions } });
  });

  router.get("/:address", async (req, res) => {
    const { address } = GetPointsParams.parse(req.params);
    const { chainId, limit } = GetPointsQuery.parse(req.query);

    const pointsEvents = await pointsEventsService.getUserPoints(address, {
      chainId,
      limit: limit ? Number(limit) : undefined,
    });

    res.send({ data: { points: pointsEvents } });
  });

  return router;
}
