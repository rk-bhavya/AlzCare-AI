import express from "express";
import { registerPatient } from "../controllers/auth.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/register/patient",
  upload.single("profilePicture"),
  registerPatient
);

export default router;