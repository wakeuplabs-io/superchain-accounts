import { Router } from "express";

import userRoute from "./users/route.js";
import milestonesRoute from "./milestones/route.js";
import eventsRoute from "./events/route.js";
import rewardsRoute from "./rewards/route.js";

const router = Router();

router.get("/health-check", (req, res) => {
  res.json({ message: "API is healthy" });
});

router.use("/users", userRoute);
router.use("/events", eventsRoute);
router.use("/milestones", milestonesRoute);
router.use("/rewards", rewardsRoute);


export default router;
