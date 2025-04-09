import { Router } from "express";

export default function buildHealthRoutes(): Router {
  const router = Router();

  router.get("/", (req, res) => {
    res.json({ message: "OK" });
  });

  return router;
}
