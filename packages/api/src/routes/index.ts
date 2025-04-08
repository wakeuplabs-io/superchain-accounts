import { Router } from "express";

import userRoute from "./users/route";
import badgesRoute from "./badges/route";
import pointsRoute from "./points/route";
import transactionsRoute from "./transactions/route";
import healthRoute from "./health/route";

const router = Router();

router.use("/health", healthRoute)
router.use("/users", userRoute);
router.use("/badges", badgesRoute);
router.use("/points", pointsRoute);
router.use("/transactions", transactionsRoute);

export default router;
