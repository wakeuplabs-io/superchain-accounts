import { Request, Response, Router, NextFunction } from "express";
import AWS from "aws-sdk";
import envParsed from "@/envParsed.js";
import { normalizeCreateAccount } from "./normalizer.js";
import { UserService } from "./service.js";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const router = Router();
const userService = new UserService(dynamoDb);

router.get(
  "/:address",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getUserById(req.params.address);
      res.send(user);
    } catch (error) {
      res.send(404).send({ message: "User not found" });
    }
  }
);

router.post(
  "/account",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      normalizeCreateAccount(req.body);
    } catch (e) {
      res.status(400).send({ message: "Invalid event" });
      return;
    }
    const payload = normalizeCreateAccount(req.body);
    const { address, name, email } = payload;
    try {
      await userService.createUser(address, name, email);
      res.send({ message: "User created", code: 201 });
    } catch (error) {
      res.status(500).send({ message: "Error creating user" });
    }
  }
);

export default router;
