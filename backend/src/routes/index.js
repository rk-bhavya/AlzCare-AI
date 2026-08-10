import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

/**
 * Central API router.
 *
 * Every feature registers its routes here.
 */

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

export default router;