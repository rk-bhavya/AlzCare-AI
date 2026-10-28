
import mongoose from "mongoose";

const patientCaregiverAssignmentSchema = new mongoose.Schema(
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

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Allow only one active assignment per patient.
patientCaregiverAssignmentSchema.index(
  { patientId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  }
);

const PatientCaregiverAssignment = mongoose.model(
  "PatientCaregiverAssignment",
  patientCaregiverAssignmentSchema
);

export default PatientCaregiverAssignment;
