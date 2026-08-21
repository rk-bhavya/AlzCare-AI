import mongoose from "mongoose";

/* ============================================================
   DAILY TASK

   A single checklist item a caregiver has set up for a patient
   (e.g. "Take morning medication", "Drink water"). Kept simple
   and completion is tracked directly on the document — no
   separate per-day log yet.

   FUTURE COMPATIBILITY (not implemented yet):
   This is the same collection the future Patient Device will
   read from and write completion status to. The caregiver
   creates the task here; later the patient will mark it
   complete from their own device, and this document is what
   Caregiver → Patient Monitoring will reflect. No duplicate
   patient-task system should ever be created — always extend
   this model/controller instead.
============================================================ */

const dailyTaskSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Medication",
        "Cognitive Activity",
        "Appointment",
        "Personal Care",
        "Other",
      ],
      default: "Other",
    },

    /* Optional time of day this task is scheduled for, "HH:mm" */
    scheduledTime: {
      type: String,
      default: "",
      validate: {
        validator: (value) =>
          value === "" || /^([01]\d|2[0-3]):([0-5]\d)$/.test(value),
        message: "Scheduled time must be in HH:mm 24-hour format",
      },
    },

    /*
     * Kept intentionally simple for now — "daily" tasks repeat
     * conceptually every day, "once" is a single occurrence.
     * No automatic daily-reset job exists yet.
     */
    frequency: {
      type: String,
      enum: ["daily", "once"],
      default: "daily",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

dailyTaskSchema.index({ patientId: 1, isActive: 1 });

const DailyTask = mongoose.model("DailyTask", dailyTaskSchema);

export default DailyTask;
