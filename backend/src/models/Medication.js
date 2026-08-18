import mongoose from "mongoose";

/* ============================================================
   MEDICATION

   Represents a recurring medication schedule assigned to a
   patient by their caregiver.

   Actual daily dose status (Pending / Taken / Missed) is
   tracked separately in MedicationLog so history can be kept
   per day without mutating the schedule itself.
============================================================ */

const medicationSchema = new mongoose.Schema(
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

    name: {
      type: String,
      required: [true, "Medication name is required"],
      trim: true,
      maxlength: 150,
    },

    dosage: {
      type: String,
      required: [true, "Dosage is required"],
      trim: true,
      maxlength: 50,
    },

    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      trim: true,
      maxlength: 50,
    },

    /*
     * Times of day this medication should be taken,
     * stored as 24-hour "HH:mm" strings, e.g. ["08:00", "20:00"]
     */
    times: {
      type: [String],
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
        message: "At least one valid time (HH:mm) is required",
      },
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: null,
    },

    instructions: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

medicationSchema.index({ patientId: 1, isActive: 1 });

const Medication = mongoose.model("Medication", medicationSchema);

export default Medication;
