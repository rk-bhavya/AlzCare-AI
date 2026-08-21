import mongoose from "mongoose";

import CognitiveActivity from "../models/CognitiveActivity.js";
import { verifyCaregiverOwnsPatient } from "./caregiver.controller.js";

export const ACTIVITY_TYPES = [
  "memory-game",
  "number-recall",
  "pattern-recognition",
  "word-recall",
];

/* ============================================================
   CREATE COGNITIVE ACTIVITY RESULT

   POST /cognitive
============================================================ */

export const createCognitiveActivity = async (req, res) => {
  try {
    const { patientId, activityType, score, durationSeconds } = req.body;

    if (!patientId || !activityType || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Patient, activity type, and score are required.",
      });
    }

    if (!ACTIVITY_TYPES.includes(activityType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity type.",
      });
    }

    const numericScore = Number(score);

    if (
      Number.isNaN(numericScore) ||
      numericScore < 0 ||
      numericScore > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Score must be a number between 0 and 100.",
      });
    }

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const activity = await CognitiveActivity.create({
      patientId,
      caregiverId: req.user._id,
      createdBy: req.user._id,
      activityType,
      score: numericScore,
      durationSeconds: durationSeconds ? Number(durationSeconds) : null,
    });

    return res.status(201).json({
      success: true,
      message: "Activity result saved successfully.",
      activity,
    });
  } catch (error) {
    console.error("Create cognitive activity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save activity result.",
    });
  }
};

/* ============================================================
   GET COGNITIVE ACTIVITY HISTORY FOR A PATIENT

   GET /cognitive/patient/:patientId
============================================================ */

export const getCognitiveHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID.",
      });
    }

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const activities = await CognitiveActivity.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const summary = ACTIVITY_TYPES.map((type) => {
      const entries = activities.filter(
        (activity) => activity.activityType === type
      );

      const average =
        entries.length > 0
          ? Math.round(
              entries.reduce((sum, entry) => sum + entry.score, 0) /
                entries.length
            )
          : null;

      return {
        activityType: type,
        attempts: entries.length,
        averageScore: average,
        lastPlayedAt: entries[0]?.createdAt || null,
      };
    });

    return res.status(200).json({
      success: true,
      activities,
      summary,
    });
  } catch (error) {
    console.error("Get cognitive history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load cognitive activity history.",
    });
  }
};
