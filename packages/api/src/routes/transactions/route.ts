import { db } from "@/database/client";
import { TransactionService } from "@/services/transactions";
import { Router, Request, Response } from "express";
import { normalizeSendUserOperation } from "./normalizer";
import {
  DaysActivePointsEventsHandler,
  PointsEventsService,
  TokenSwapPointsEventsHandler,
  TransactionSentPointsEventsHandler,
  UniqueChainTransactionPointsEventsHandler,
} from "@/services/points-events";
import {
  BadgeEventsService,
  DaysActiveBadgeEventsHandler,
  DefiInteractionsBadgeEventsHandler,
  TransactionSentBadgeEventsHandler,
} from "@/services/badges-events";

const router = Router();
const transactionService = new TransactionService(db);

const pointsEventsService = new PointsEventsService([
  new TransactionSentPointsEventsHandler(db, 1, [{ count: 2, points: 1 }]),
  new TokenSwapPointsEventsHandler(db, 2),
  new UniqueChainTransactionPointsEventsHandler(db, 5),
  new DaysActivePointsEventsHandler(db, [{ count: 2, points: 1 }]),
]);

const badgesEventsService = new BadgeEventsService([
  new TransactionSentBadgeEventsHandler(db, [1, 10, 100]),
  new DaysActiveBadgeEventsHandler(db, [1, 10, 100]),
  new DefiInteractionsBadgeEventsHandler(db, [1, 10, 100]),
]);

router.post("/send", async (req: Request, res: Response) => {
  const result = normalizeSendUserOperation(req.body);

  if(!result.success) {
    return res.status(400).send({
      message: "Invalid request",
      data: result.error.errors,
    });
  }

  const tx = await transactionService.sendUserOperation(result.data.operation, result.data.chainId);

  // determine points events
  const points = await pointsEventsService.handleNewTransaction(tx);
  const badges = await badgesEventsService.handleNewTransaction(tx);

  return res.send({
    message: "Transaction sent",
    data: {
      transaction: tx,
      points: points,
      badges: badges,
    },
  });
});

export default router;
