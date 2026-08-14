import { Router } from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import caregiverRoutes from "./caregiver.routes.js";
import doctorRoutes from "./doctor.routes.js";

const router = Router();

/**
 * Central API router.
 *
 * Every feature registers its routes here.
 */

router.use(
  "/health",
  healthRoutes
);

router.use(
  "/auth",
  authRoutes
);

router.use(
  "/caregiver",
  caregiverRoutes
);

router.use(
  "/doctor",
  doctorRoutes
);

export default router;