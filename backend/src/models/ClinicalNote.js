import mongoose from "mongoose";

const clinicalNoteSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    note: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  }
);

const ClinicalNote =
  mongoose.model(
    "ClinicalNote",
    clinicalNoteSchema
  );

export default ClinicalNote;