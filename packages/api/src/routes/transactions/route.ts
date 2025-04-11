import { Router, Request, Response } from "express";
import { normalizeSendUserOperation } from "./normalizer";
import { ITransactionService } from "@/services/transactions";
import { IPointsEventsService } from "@/domain/points";
import { IBadgesEventsService } from "@/domain/badges";

export default function buildTransactionsRoutes(
  transactionService: ITransactionService,
  pointsEventsService: IPointsEventsService,
  badgesEventsService: IBadgesEventsService
): Router {
  const router = Router();

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

  return router;
}
