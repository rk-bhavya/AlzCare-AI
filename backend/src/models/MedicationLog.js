import mongoose from "mongoose";

/* ============================================================
   MEDICATION LOG

   Tracks the status of a single scheduled dose on a single
   calendar day, e.g. "Donepezil at 08:00 on 2026-08-18 = Taken".

   One document per (medication, date, time).
============================================================ */

const medicationLogSchema = new mongoose.Schema(
  {
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medication",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* Calendar date this dose belongs to, format: YYYY-MM-DD */
    date: {
      type: String,
      required: true,
    },

    /* Scheduled time of day, format: HH:mm */
    time: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["taken", "missed"],
      required: true,
    },

    takenAt: {
      type: Date,
      default: null,
    },

    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

medicationLogSchema.index(
  { medicationId: 1, date: 1, time: 1 },
  { unique: true }
);

const MedicationLog = mongoose.model("MedicationLog", medicationLogSchema);

export default MedicationLog;
