import { Router } from "express";

import userRoute from "./users/route.js";
import badgesRoute from "./badges/route.js";
import pointsRoute from "./points/route.js";
import transactionsRoute from "./transactions/route.js";
import healthRoute from "./health/route.js";

const router = Router();

router.use("/health", healthRoute)
router.use("/users", userRoute);
router.use("/badges", badgesRoute);
router.use("/points", pointsRoute);
router.use("/transactions", transactionsRoute);

export default router;
