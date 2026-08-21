import mongoose from "mongoose";

/* ============================================================
   PATIENT DEVICE

   Represents a single device (e.g. a tablet) associated with
   exactly one patient. The patient never has a username or
   password — a caregiver pairs a device to the patient instead,
   and the device authenticates itself using a device token.

   LIFECYCLE:

   1. Caregiver requests setup  -> status: "pending"
      A one-time pairing code is generated and hashed
      (pairingCodeHash). The RAW code is shown to the caregiver
      exactly once and never stored.

   2. Device redeems the pairing code -> status: "active"
      A device token is generated and hashed (deviceTokenHash).
      The RAW token is returned to the device exactly once and
      never stored. The pairing code is cleared so it can never
      be reused.

   3. Caregiver can revoke at any time -> status: "revoked"
      deviceTokenHash is cleared, so the device can never
      authenticate again.

   SECURITY: Only hashes are ever persisted — never the raw
   pairing code or device token.
============================================================ */

const patientDeviceSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* Caregiver who set up / most recently managed this device */
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deviceName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Patient Device",
    },

    status: {
      type: String,
      enum: ["pending", "active", "revoked"],
      default: "pending",
      index: true,
    },

    /* Hash of the one-time pairing code — never the raw code */
    pairingCodeHash: {
      type: String,
      default: null,
      index: true,
    },

    pairingCodeExpiresAt: {
      type: Date,
      default: null,
    },

    /* Hash of the active device token — never the raw token */
    deviceTokenHash: {
      type: String,
      default: null,
      index: true,
    },

    pairedAt: {
      type: Date,
      default: null,
    },

    lastActiveAt: {
      type: Date,
      default: null,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    /*
     * GPS FOUNDATION ONLY — no geofencing, no history, just the
     * single latest known point reported by this device (with
     * the patient's permission). Never fabricated: absent until
     * the device successfully reports a real browser geolocation
     * reading.
     */
    lastKnownLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

patientDeviceSchema.index({ patientId: 1, status: 1 });

const PatientDevice = mongoose.model("PatientDevice", patientDeviceSchema);

export default PatientDevice;
