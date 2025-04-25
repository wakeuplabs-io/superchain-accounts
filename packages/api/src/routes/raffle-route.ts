import { ISuperchainRaffleService } from "@/domain/raffle";
import { Router } from "express";
import { createRaffleBodySchema } from "schemas";

export function buildRaffleRoutes(superchainRaffleService: ISuperchainRaffleService): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    const raffleParsedData = createRaffleBodySchema.safeParse(req.body);
    if (!raffleParsedData.success) {
      res.status(400).send({ error: raffleParsedData.error.issues });
      return;
    }

    try {
      const raffle = await superchainRaffleService.createRaffle(raffleParsedData.data);
      res.send({ data: { raffle } });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  return router;
}