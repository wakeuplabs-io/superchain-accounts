import { Router } from "express";
import { IBadgesEventsService } from "@/services/badge-events";

export default function buildBadgesRoutes(badgeEventsService: IBadgesEventsService): Router {
  const router = Router();

  router.get("/:address", async (req, res) => {
    const address = req.params.address;

    const badgesEvents = await badgeEventsService.getUserBadges(address);

    res.send({ data: { badges: badgesEvents } });
  });

  return router;
}
