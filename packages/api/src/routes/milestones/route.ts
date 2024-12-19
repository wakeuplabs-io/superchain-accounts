import { Router } from "express";
import mappingRoute from "./mapping/route.js";

const router = Router();

router.use("/mapping", mappingRoute);

export default router;
