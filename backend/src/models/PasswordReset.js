import mongoose from "mongoose";

const passwordResetSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      method: {
        type: String,
        enum: ["email", "phone"],
        required: true,
      },

      otpHash: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      attempts: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

passwordResetSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const PasswordReset =
  mongoose.model(
    "PasswordReset",
    passwordResetSchema
  );

export default PasswordReset;