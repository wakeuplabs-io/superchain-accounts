import { Router, Request, Response } from "express";
import { db } from "@/database/client.js";
import { TokenService } from "@/services/token.js";
import { importUserTokenRequestSchema } from "schemas";

const router = Router();
const tokenService = new TokenService(db);

router.post("/import", async (req: Request, res: Response) => {
  const requestData = importUserTokenRequestSchema.safeParse(req.body);

  if(!requestData.success) {
    return res.status(400).send(requestData.error.issues);
  }

  try {
    const response = await tokenService.importToken(requestData.data);
    return res.status(200).send(response);
  } catch (error) {
    console.log(error);
    if(error instanceof Error) {
      return res.status(500).json({message: error.message});
    }

    return res.status(500).send(error);
  }

});

export default router;