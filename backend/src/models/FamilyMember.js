import mongoose from "mongoose";

/* ============================================================
   FAMILY MEMBER

   Belongs to a specific patient. Captures the people the
   patient should recognize day-to-day.

   IMPORTANT (future roadmap — NOT implemented yet):
   The `photo` field is stored today purely as reference data.
   It will later become the known-face reference image consumed
   by the Patient Device's face-recognition feature. No matching
   or recognition logic exists yet — this model only persists
   the data architecture needed for that future integration.
============================================================ */

const familyMemberSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
     * Whoever registered this family member — normally the
     * caregiver managing the patient, but may also be the
     * patient themself at registration time.
     */
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Family member name is required"],
      trim: true,
      maxlength: 100,
    },

    relationship: {
      type: String,
      required: [true, "Relationship is required"],
      trim: true,
      maxlength: 50,
    },

    /*
     * Optional reference photo. Empty until a photo is
     * uploaded — used only to display "Face profile registered"
     * in the UI. No recognition happens against this image yet.
     */
    photo: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    // Biometric template only; it is never returned to the browser.
    faceEmbedding: {
      type: [Number],
      default: undefined,
      select: false,
    },
    faceEmbeddingModel: { type: String, default: "", select: false },
    faceProfileRegistered: { type: Boolean, default: false },

    // Biometric template only. It is deliberately excluded from normal
    // queries and API responses; the browser never receives this value.
    faceEmbedding: {
      type: [Number],
      default: undefined,
      select: false,
    },

    faceEmbeddingModel: {
      type: String,
      default: "",
      select: false,
    },

    faceProfileRegistered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

familyMemberSchema.index({ patientId: 1, createdAt: -1 });

const FamilyMember = mongoose.model("FamilyMember", familyMemberSchema);

export default FamilyMember;
