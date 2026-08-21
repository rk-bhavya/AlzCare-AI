import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import PatientDevice from "../models/PatientDevice.js";

/* ============================================================
   AUTHENTICATION MIDDLEWARE
============================================================ */

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

/* ============================================================
   ROLE AUTHORIZATION
============================================================ */

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access this resource.",
      });
    }

    next();
  };
};
/* ============================================================
   PATIENT DEVICE AUTHENTICATION

   A SEPARATE authentication mechanism for the future Patient
   Device. The patient has no username/password — a caregiver
   pairs a device to the patient (see PatientDevice model /
   patientDevice.controller.js), and the device authenticates
   every request using a device token instead of a JWT.

   This does NOT replace or modify `protect` above. Routes that
   will one day serve the Patient Dashboard should use this
   middleware instead of `protect`.

   Expected header:
     x-device-token: <raw device token>
============================================================ */

export const protectPatientDevice = async (req, res, next) => {
  try {
    const deviceToken = req.headers["x-device-token"];

    if (!deviceToken || typeof deviceToken !== "string") {
      return res.status(401).json({
        success: false,
        message: "Device authentication required.",
      });
    }

    const deviceTokenHash = crypto
      .createHash("sha256")
      .update(deviceToken)
      .digest("hex");

    const device = await PatientDevice.findOne({
      deviceTokenHash,
      status: "active",
    });

    if (!device) {
      return res.status(401).json({
        success: false,
        message: "Invalid or revoked device.",
      });
    }

    const patient = await User.findOne({
      _id: device.patientId,
      role: "patient",
    }).select("-password");

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Associated patient account no longer exists.",
      });
    }

    device.lastActiveAt = new Date();
    await device.save();

    req.patient = patient;
    req.patientDevice = device;

    next();
  } catch (error) {
    console.error("Patient device authentication error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid device session.",
    });
  }
};
