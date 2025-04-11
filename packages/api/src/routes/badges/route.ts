import { Router } from "express";
import { cronAuth } from "@/middlewares/cron-auth";
import { IBadgesEventsService } from "@/domain/badges";
import { GetBadgesParams, GetBadgesQuery } from "schemas";

export default function buildBadgesRoutes(
  badgeEventsService: IBadgesEventsService
): Router {
  const router = Router();

  router.post("/submit", cronAuth, async (_, res) => {
    const transactions = await badgeEventsService.submit();

    res.send({ data: { transactions } });
  });

  router.get("/:address", async (req, res) => {
    const { address } = GetBadgesParams.parse(req.params);
    const { chainId, limit } = GetBadgesQuery.parse(req.query);

    const badgesEvents = await badgeEventsService.getUserBadges(address, {
      chainId,
      limit: limit ? Number(limit) : undefined,
    });

    res.send({ data: { badges: badgesEvents } });
  });

  return router;
}
