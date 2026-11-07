import { Router, type IRouter } from "express";
import healthRouter from "./health";
import campassRouter from './campass';

const router: IRouter = Router();

router.use(healthRouter);
router.use('/campass', campassRouter);

export default router;
