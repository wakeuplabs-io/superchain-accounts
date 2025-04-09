import { Router } from "express";
import { IBadgesEventsService } from "@/services/badge-events";

export default function buildBadgesRoutes(
  badgeEventsService: IBadgesEventsService
): Router {
  const router = Router();

  router.post("/submit", async (req, res) => {
    // verify api key
    if (req.headers["x-api-key"] !== process.env.API_KEY) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    await badgeEventsService.submit();
  });

  router.get("/:address", async (req, res) => {
    const address = req.params.address;

    // TODO: filter by chain, and limit

    const badgesEvents = await badgeEventsService.getUserBadges(address);

    res.send({ data: { badges: badgesEvents } });
  });

  return router;
}
