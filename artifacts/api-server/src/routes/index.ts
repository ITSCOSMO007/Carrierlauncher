import { Router, type IRouter } from "express";
import healthRouter from "./health";
import careerRouter from "./career";
import chatRouter from "./chat";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/career", careerRouter);
router.use("/chat", chatRouter);
router.use("/reports", reportsRouter);

export default router;
