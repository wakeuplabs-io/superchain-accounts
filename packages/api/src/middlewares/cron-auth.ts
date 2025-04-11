import envParsed from "@/envParsed";
import { NextFunction, Request, Response } from "express";

export function cronAuth(req: Request, res: Response, next: NextFunction) {
  if (req.headers["x-cron-key"] !== envParsed().CRONJOB_KEY) {
    return next(new Error("Unauthorized"));
  }

  next();
}
