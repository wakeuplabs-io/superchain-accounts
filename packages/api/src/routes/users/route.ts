import { IUserService, IUserTokenService } from "@/domain/users";
import { Router, Request, Response } from "express";
import { getUserTokensRequestSchema, importUserTokenRequestSchema, userWalletSchema } from "schemas";

export default function buildUserRoutes(userService: IUserService, userTokenService: IUserTokenService): Router {
  const router = Router();

  router.get("/:wallet/profile", async (req: Request, res: Response) => {
    const parsedWallet = userWalletSchema.safeParse(req.params.wallet);

    if(!parsedWallet.success) {
      return res.status(400).send(parsedWallet.error.issues);
    }

    try {
      const profile = await userService.getProfile(parsedWallet.data);
      res.send({ data: { profile } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({message: error.message});
    }
  });

  router.get("/:wallet/tokens", async (req: Request, res: Response) => {
    const requestData = getUserTokensRequestSchema.safeParse({
      userWallet: req.params.wallet,
      chainId: req.query.chainId,
    });

    if(!requestData.success) {
      return res.status(400).send(requestData.error.issues);
    }

    try {
      const userTokens = await userTokenService.getUserTokens(requestData.data);
      return res.status(200).send(userTokens);
    } catch (error) {
      console.error(error);
      return res.status(500).json({message: "Failed to get user tokens"});
    }
  });

  router.post("/:wallet/tokens", async (req: Request, res: Response) => {
    const requestData = importUserTokenRequestSchema.safeParse({
      ...req.body,
      userWallet: req.params.wallet,
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