import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ============================================================
       BASIC INFORMATION
    ============================================================ */

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [
        2,
        "Full name must contain at least 2 characters",
      ],
      maxlength: [
        100,
        "Full name cannot exceed 100 characters",
      ],
    },

    age: {
      type: Number,
      required: function () {
        return this.role === "patient";
      },
      min: [1, "Age must be at least 1"],
      max: [120, "Age cannot exceed 120"],
    },

    gender: {
      type: String,
      required: function () {
        return this.role === "patient";
      },
      enum: {
        values: [
          "male",
          "female",
          "other",
          "prefer-not-to-say",
        ],
        message: "Please select a valid gender",
      },
    },

    /* ============================================================
       CONTACT INFORMATION
    ============================================================ */

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit phone number",
      ],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [
        5,
        "Address must contain at least 5 characters",
      ],
      maxlength: [
        500,
        "Address cannot exceed 500 characters",
      ],
    },

    /* ============================================================
       AUTHENTICATION
    ============================================================ */

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [
        8,
        "Password must contain at least 8 characters",
      ],
    },

    role: {
      type: String,
      required: true,
      enum: [
        "patient",
        "caregiver",
        "doctor",
        "admin",
      ],
      default: "patient",
    },

    /* ============================================================
       PATIENT / CAREGIVER INFORMATION
    ============================================================ */

    emergencyContact: {
      type: String,
      required: function () {
        return this.role === "patient";
      },
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid emergency contact number",
      ],
    },

    relationship: {
      type: String,
      required: function () {
        return (
          this.role === "patient" ||
          this.role === "caregiver"
        );
      },
      enum: {
        values: [
          "parent",
          "spouse",
          "child",
          "sibling",
          "relative",
          "friend",
          "other",
        ],
        message: "Please select a valid relationship",
      },
    },

    /* ============================================================
       DOCTOR INFORMATION
    ============================================================ */

    doctorDetails: {
      specialization: {
        type: String,
        required: function () {
          return this.role === "doctor";
        },
        trim: true,
        minlength: [
          2,
          "Specialization must contain at least 2 characters",
        ],
        maxlength: [
          100,
          "Specialization cannot exceed 100 characters",
        ],
      },

      registrationNumber: {
        type: String,
        required: function () {
          return this.role === "doctor";
        },
        trim: true,
        uppercase: true,
        minlength: [
          3,
          "Registration number is required",
        ],
        maxlength: [
          50,
          "Registration number cannot exceed 50 characters",
        ],
      },

      hospital: {
        type: String,
        required: function () {
          return this.role === "doctor";
        },
        trim: true,
        minlength: [
          2,
          "Hospital or clinic name is required",
        ],
        maxlength: [
          150,
          "Hospital or clinic name cannot exceed 150 characters",
        ],
      },
    },

    /* ============================================================
       PROFILE PICTURE
    ============================================================ */

    profilePicture: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;