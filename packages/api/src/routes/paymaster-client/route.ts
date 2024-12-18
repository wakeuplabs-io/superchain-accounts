import { Router, Request, Response } from "express";
import jsonrpc from "jsonrpc-lite";
import { PaymasterService } from "./PaymasterService.js";
import envParsed from "@/envParsed.js";

const router = Router();
const paymasterService = new PaymasterService(envParsed().PAYMASTER_ADDRESS);

router.post("/v1/rpc", (req: Request, res: Response) => {
  const jsonRpcRequest = jsonrpc.parseObject(req.body);

  const response = paymasterService.handleRequest(jsonRpcRequest);

  res.send(response);
});

export default router;