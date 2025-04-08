import { db } from "@/database/client";
import { TransactionService } from "@/services/transactions";
import { Router, Request, Response } from "express";
import { normalizeSendUserOperation } from "./normalizer";
import {
  DaysActiveHandler,
  PointsEventsService,
  TokenSwapHandler,
  TransactionSentHandler,
  UniqueChainTransactionHandler,
} from "@/services/points-events";

const router = Router();
const transactionService = new TransactionService(db);

const pointsEventsService = new PointsEventsService([
  new TransactionSentHandler(db, 1, [{ count: 2, points: 1 }]),
  new TokenSwapHandler(db, 2),
  new UniqueChainTransactionHandler(db, 5),
  new DaysActiveHandler(db, [{ count: 2, points: 1 }]),
]);

router.post("/send", async (req: Request, res: Response) => {
  const { chainId, operation } = normalizeSendUserOperation(req.body);

  const tx = await transactionService.sendUserOperation(operation, chainId);

  // determine points events
  const points = await pointsEventsService.handleNewTransaction(tx);

  return res.send({
    message: "Transaction sent",
    data: {
      transaction: tx,
      points: points,
    },
  });
});

export default router;
