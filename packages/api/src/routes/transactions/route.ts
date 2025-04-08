import { db } from "@/database/client";
import { TransactionService } from "@/services/transactions";
import { Router, Request, Response } from "express";
import { normalizeSendUserOperation } from "./normalizer";

const router = Router();
const transactionService = new TransactionService(db);

router.post("/send", async (req: Request, res: Response) => {
  const { chainId, operation } = normalizeSendUserOperation(req.body);

  const tx = await transactionService.sendUserOperation(operation, chainId);

  // TODO: given tx: determine create points events and badge events

  return res.send({
    message: "Transaction sent",
    data: tx,
  });
});

export default router;
