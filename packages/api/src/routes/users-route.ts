import { IUserTokenService } from "@/services/user-token";
import { Router, Request, Response } from "express";
import { importUserTokenRequestSchema } from "schemas";

export default function buildUserRoutes(userTokenService: IUserTokenService): Router {
  const router = Router();

  router.post("/:userAddress/tokens", async (req: Request, res: Response) => {
    const requestData = importUserTokenRequestSchema.safeParse({
      ...req.body,
      userAddress: req.params.userAddress,
    });

    if(!requestData.success) {
      return res.status(400).send(requestData.error.issues);
    }

    try {
      const response = await userTokenService.importToken(requestData.data);
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      if(error instanceof Error) {
        return res.status(500).json({message: error.message});
      }

      return res.status(500).send(error);
    }
  });

  return router;
}