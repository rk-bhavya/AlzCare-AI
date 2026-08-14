import mongoose from "mongoose";

const careAssignmentSchema = new mongoose.Schema(
  {
    /* ============================================================
       CAREGIVER
    ============================================================ */

    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ============================================================
       PATIENT
    ============================================================ */

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ============================================================
       DOCTOR
    ============================================================ */

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ============================================================
       ASSIGNMENT STATUS
    ============================================================ */

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "pending",
      ],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Prevent duplicate active relationships
 * between the same caregiver and patient.
 */

careAssignmentSchema.index(
  {
    caregiverId: 1,
    patientId: 1,
  },
  {
    unique: true,
  }
);

const CareAssignment =
  mongoose.model(
    "CareAssignment",
    careAssignmentSchema
  );

export default CareAssignment;