import { db } from "@/database/client";
import { BadgeEventsService } from "@/services/badges-events";
import { Router } from "express";

const router = Router();

const badgeEventsService = new BadgeEventsService(db, []);

router.get("/:address", async (req, res) => {
  const address = req.params.address;

  const badgesEvents = await badgeEventsService.getUserBadges(address);

  res.send({ data: { badges: badgesEvents } });
});

export default router;
