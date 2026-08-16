import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema(
  {
    /* ============================================================
       RECIPIENT
    ============================================================ */

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },


    /* ============================================================
       OPTIONAL PATIENT
    ============================================================ */

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    /* ============================================================
       NOTIFICATION CONTENT
    ============================================================ */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },


    /* ============================================================
       TYPE
    ============================================================ */

    type: {
      type: String,
      enum: [
        "info",
        "warning",
        "critical",
        "success",
      ],
      default: "info",
    },


    /* ============================================================
       READ STATUS
    ============================================================ */

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },


    /* ============================================================
       OPTIONAL REFERENCE
       
       Used when notification is related to:
       - assessment
       - appointment
       - patient
    ============================================================ */

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceType: {
      type: String,
      enum: [
        "assessment",
        "appointment",
        "patient",
        "system",
        null,
      ],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


const Notification =
  mongoose.model(
    "Notification",
    notificationSchema
  );


export default Notification;