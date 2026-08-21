import mongoose from "mongoose";

/* ============================================================
   COGNITIVE ACTIVITY

   Stores the result of a cognitive assistance activity
   completed by (or on behalf of) a patient.

   IMPORTANT: These scores are informal engagement activities,
   never a medical diagnosis.
============================================================ */

const cognitiveActivitySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * Optional — the caregiver managing this patient at the time
     * of the activity, when resolvable. Loosened from required
     * so activities submitted directly by the Patient Device
     * (via protectPatientDevice, no caregiver in request context)
     * can still be saved even in the rare case no active
     * CareAssignment is found.
     */
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    activityType: {
      type: String,
      required: true,
      enum: [
        "memory-game",
        "number-recall",
        "pattern-recognition",
        "word-recall",
      ],
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    durationSeconds: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

cognitiveActivitySchema.index({ patientId: 1, createdAt: -1 });

const CognitiveActivity = mongoose.model(
  "CognitiveActivity",
  cognitiveActivitySchema
);

export default CognitiveActivity;
