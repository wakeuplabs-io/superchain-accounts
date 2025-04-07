import { db } from "@/database/client.js";
import { TransactionService } from "@/services/transactions.js";
import { Router, Request, Response } from "express";
import { normalizeSendUserOperation } from "./normalizer.js";

const router = Router();
const transactionService = new TransactionService(db);

router.post("/send", async (req: Request, res: Response) => {
  const { chainId, operation } = normalizeSendUserOperation(req.body);

  const tx = await transactionService.sendUserOperation(operation, chainId);

  return res.send({
    message: "Transaction sent",
    data: tx,
  });
});

export default router;
