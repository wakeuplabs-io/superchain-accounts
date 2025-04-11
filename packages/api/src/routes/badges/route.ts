import { Router } from "express";
import { IBadgesEventsService } from "@/services/badge-events";
import envParsed from "@/envParsed";

export default function buildBadgesRoutes(
  badgeEventsService: IBadgesEventsService
): Router {
  const router = Router();

  router.post("/submit", async (req, res) => {
    // verify api key
    // Should not be a middleware? Is it only used here?
    if (req.headers["x-cron-key"] !== envParsed().CRONJOB_KEY) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    res.send({ data: { transactions: await badgeEventsService.submit() } });
  });

  router.get("/:address", async (req, res) => {
    const address = req.params.address;
    const chainId = req.query.chainId as string; // TODO: define a type for chainId
    const limit = req.query.limit;

    // TODO: missing schema

    const badgesEvents = await badgeEventsService.getUserBadges(address, {
      chainId,
      limit: limit ? Number(limit) : undefined,
    });

    res.send({ data: { badges: badgesEvents } });
  });

  return router;
}
