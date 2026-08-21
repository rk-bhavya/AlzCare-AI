import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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
       Optional because a doctor can schedule an appointment
       directly with a patient.
    ============================================================ */

    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    /* ============================================================
       APPOINTMENT TYPE
    ============================================================ */

    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },


    /* ============================================================
       DATE & TIME
    ============================================================ */

    appointmentDate: {
      type: Date,
      required: true,
    },


    /* ============================================================
       STATUS
    ============================================================ */

    status: {
      type: String,
      enum: [
        "scheduled",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      default: "scheduled",
    },


    /* ============================================================
       NOTES
    ============================================================ */

    notes: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Notes cannot exceed 1000 characters",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


/* ============================================================
   INDEXES
============================================================ */

appointmentSchema.index({
  doctorId: 1,
  appointmentDate: 1,
});

appointmentSchema.index({
  patientId: 1,
  appointmentDate: 1,
});


const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

export default Appointment;