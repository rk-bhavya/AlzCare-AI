import { Router } from "express";
import healthRoutes from "./health.routes.js";

const router = Router();

/**
 * Central API router.
 * Every new feature adds exactly ONE line here, for example:
 *   router.use("/auth", authRoutes);
 *   router.use("/patients", patientRoutes);
 */
router.use("/health", healthRoutes);

export default router;
