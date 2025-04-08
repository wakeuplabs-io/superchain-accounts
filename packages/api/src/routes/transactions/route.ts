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

const pointsEventsService = new PointsEventsService(db, [
  new TransactionSentPointsEventsHandler(db, 1, [
    { count: 10, points: 10 },
    { count: 50, points: 50 },
    { count: 100, points: 100 },
  ]),
  new DaysActivePointsEventsHandler(db, [
    { count: 10, points: 10 },
    { count: 50, points: 50 },
    { count: 100, points: 100 },
  ]),
  new UniqueChainTransactionPointsEventsHandler(db, 5),
  new TokenSwapPointsEventsHandler(db, 5),
]);

const badgesEventsService = new BadgeEventsService(db, [
  new TransactionSentBadgeEventsHandler(db, [10, 50, 100]),
  new DaysActiveBadgeEventsHandler(db, [10, 50, 100]),
  new DefiInteractionsBadgeEventsHandler(db, [10, 50, 100]),
]);

router.post("/send", async (req: Request, res: Response) => {
  const result = normalizeSendUserOperation(req.body);

  if (!result.success) {
    return res.status(400).send({
      message: "Invalid request",
      data: result.error.errors,
    });
  }

  // send transaction
  const tx = await transactionService.sendUserOperation(
    result.data.operation,
    result.data.chainId
  );

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
