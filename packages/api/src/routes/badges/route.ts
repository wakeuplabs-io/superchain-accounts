import { Router } from "express";
import { cronAuth } from "@/middlewares/cron-auth";
import {
  IBadgesEventsService,
  ISuperchainBadgesService,
} from "@/domain/badges";
import { SetBadgeURIBody } from "./schema";
import { GetBadgesParams, GetBadgesQuery } from "schemas";

export default function buildBadgesRoutes(
  badgeEventsService: IBadgesEventsService,
  badgesService: ISuperchainBadgesService
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

  router.post("/uri", cronAuth, async (req, res) => {
    const result = SetBadgeURIBody.safeParse(req.body);

    if (!result.success) {
      return res.status(400).send({
        message: "Invalid request",
        errors: result.error.errors,
      });
    }

    try {
      const { chainId, tokenId, uri } = result.data;

      const tx = await badgesService.setURI(chainId, BigInt(tokenId), uri);

      return res.status(200).send({
        message: "Badge URI updated successfully",
        data: { transactionHash: tx },
      });
    } catch (error) {
      console.error("Failed to set badge URI:", error);
      return res.status(500).send({
        message: "Failed to set badge URI",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}
