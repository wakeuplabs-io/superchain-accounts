import { db } from "@/database/client.js";
import { TransactionService } from "@/services/transactions.js";
import { Router, Request, Response } from "express";
import { normalizeSendUserOperation } from "./normalizer.js";

const router = Router();
const transactionService = new TransactionService(db);

router.post("/send", async (req: Request, res: Response) => {
  const result = normalizeSendUserOperation(req.body);

  if(!result.success) {
    return res.status(400).send({
      message: "Invalid request",
      data: result.error.errors,
    });
  }

  const tx = await transactionService.sendUserOperation(result.data.operation, result.data.chainId);

  return res.send({
    message: "Transaction sent",
    data: tx,
  });
});

export default router;
