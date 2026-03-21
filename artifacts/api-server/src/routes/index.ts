import { Router, type IRouter } from "express";
import authRoutes from "./auth.js";
import healthRoutes from "./health.js";
import ocrLogsRoutes from "./ocr-logs.js";
import ordersRoutes from "./orders.js";
import patientsRoutes from "./patients.js";
import pharmaciesRoutes from "./pharmacies.js";
import settingsRoutes from "./settings.js";
import notificationsRoutes from "./notifications.js";
import statsRoutes from "./stats.js";

const router: IRouter = Router();

router.use("/", authRoutes);
router.use("/", healthRoutes);
router.use("/", ocrLogsRoutes);
router.use("/", ordersRoutes);
router.use("/", patientsRoutes);
router.use("/", pharmaciesRoutes);
router.use("/", settingsRoutes);
router.use("/", notificationsRoutes);
router.use("/", statsRoutes);

export default router;
