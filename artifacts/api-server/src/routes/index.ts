import { Router, type IRouter } from "express";
import healthRouter from "./health";
import settingsRouter from "./settings";
import analyticsRouter from "./analytics";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(settingsRouter);
router.use(analyticsRouter);

export default router;
