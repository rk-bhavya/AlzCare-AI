import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
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
       CAREGIVER

       Stored so the assessment remains connected
       to the caregiver assigned at the time.
    ============================================================ */

    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    /* ============================================================
       ASSESSMENT PERFORMED BY

       This records the actual user who performed
       the AI assessment.

       Can be:
       - Doctor
       - Caregiver
    ============================================================ */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    /* ============================================================
       MRI / CT IMAGE
    ============================================================ */

    image: {
      url: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        default: "",
      },
    },


    /* ============================================================
       AI PREDICTION
    ============================================================ */

    prediction: {
      type: String,
      required: true,

      enum: [
        "Non Demented",
        "Very Mild Dementia",
        "Mild Dementia",
        "Moderate Dementia",
      ],
    },


    /* ============================================================
       CONFIDENCE

       Stored as percentage.

       Example:
       87.42
    ============================================================ */

    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },


    /* ============================================================
       CLASS PROBABILITIES
    ============================================================ */

    probabilities: {
      nonDemented: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      veryMildDementia: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      mildDementia: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      moderateDementia: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },


    /* ============================================================
       DOCTOR / CLINICAL NOTES
    ============================================================ */

    notes: {
      type: String,

      trim: true,

      maxlength: [
        2000,
        "Notes cannot exceed 2000 characters",
      ],

      default: "",
    },


    /* ============================================================
       MODEL INFORMATION
    ============================================================ */

    model: {
      name: {
        type: String,
        default: "EfficientNetB0",
      },

      version: {
        type: String,
        default: "1.0",
      },
    },
  },

  {
    timestamps: true,
  }
);


/* ============================================================
   INDEXES
============================================================ */

assessmentSchema.index({
  patientId: 1,
  createdAt: -1,
});

assessmentSchema.index({
  doctorId: 1,
  createdAt: -1,
});

assessmentSchema.index({
  caregiverId: 1,
  createdAt: -1,
});

assessmentSchema.index({
  createdBy: 1,
  createdAt: -1,
});


/* ============================================================
   MODEL
============================================================ */

const Assessment =
  mongoose.model(
    "Assessment",
    assessmentSchema
  );

export default Assessment;