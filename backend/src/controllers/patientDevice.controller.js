import crypto from "crypto";

import PatientDevice from "../models/PatientDevice.js";
import User from "../models/User.js";
import Medication from "../models/Medication.js";
import MedicationLog from "../models/MedicationLog.js";
import DailyTask from "../models/DailyTask.js";
import CognitiveActivity from "../models/CognitiveActivity.js";
import CareAssignment from "../models/CareAssignment.js";
import Notification from "../models/Notification.js";
import FamilyMember from "../models/FamilyMember.js";
import FaceRecognitionEvent from "../models/FaceRecognitionEvent.js";
import { generateFaceEmbedding, recognizeFace, FaceRecognitionServiceError } from "../services/faceRecognition.service.js";
import { verifyCaregiverOwnsPatient } from "./caregiver.controller.js";
import { computeTodaysScheduleForPatient } from "./medication.controller.js";
import { ACTIVITY_TYPES } from "./cognitive.controller.js";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const todayKey = () => new Date().toISOString().slice(0, 10);

/* ============================================================
   SECURITY HELPERS

   Pairing codes and device tokens are cryptographically random
   and high-entropy, so a fast SHA-256 hash (rather than a slow
   password hash like bcrypt) is the correct, standard approach
   for storing them — the same pattern used for API keys. The
   raw value is only ever generated in memory, returned once to
   the caller, and never persisted.
============================================================ */

const PAIRING_CODE_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
const PAIRING_CODE_LENGTH = 8;
const PAIRING_CODE_TTL_MINUTES = 15;

const generatePairingCode = () => {
  const bytes = crypto.randomBytes(PAIRING_CODE_LENGTH);
  let code = "";

  for (let i = 0; i < PAIRING_CODE_LENGTH; i += 1) {
    code += PAIRING_CODE_CHARSET[bytes[i] % PAIRING_CODE_CHARSET.length];
  }

  return code;
};

const generateDeviceToken = () => crypto.randomBytes(32).toString("hex");

const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

/* ============================================================
   SHARED: CREATE OR REFRESH A PENDING PAIRING FOR A PATIENT

   Reused by both "setup" and "regenerate". Returns the RAW
   pairing code — the only time it is ever available in plain
   text.
============================================================ */

const createPendingPairing = async (patientId, caregiverId, existingDoc) => {
  const rawCode = generatePairingCode();
  const pairingCodeExpiresAt = new Date(
    Date.now() + PAIRING_CODE_TTL_MINUTES * 60 * 1000
  );

  const device =
    existingDoc ||
    new PatientDevice({
      patientId,
      caregiverId,
    });

  device.caregiverId = caregiverId;
  device.status = "pending";
  device.pairingCodeHash = hashValue(rawCode);
  device.pairingCodeExpiresAt = pairingCodeExpiresAt;
  device.deviceTokenHash = null;
  device.pairedAt = null;
  device.revokedAt = null;

  await device.save();

  return { device, rawCode, pairingCodeExpiresAt };
};

/* ============================================================
   CAREGIVER: SET UP / PAIR A NEW PATIENT DEVICE

   POST /patient-devices/patient/:patientId/setup
============================================================ */

export const setupPatientDevice = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { deviceName } = req.body;

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const existing = await PatientDevice.findOne({
      patientId,
      status: { $in: ["pending", "active"] },
    });

    if (existing) {
      const stillPendingAndValid =
        existing.status === "pending" &&
        existing.pairingCodeExpiresAt &&
        existing.pairingCodeExpiresAt > new Date();

      if (existing.status === "active" || stillPendingAndValid) {
        return res.status(409).json({
          success: false,
          message:
            existing.status === "active"
              ? "This patient already has a connected device. Revoke it before setting up a new one."
              : "A pairing code is already active for this patient. Use regenerate to get a new one.",
        });
      }
    }

    if (deviceName !== undefined && existing) {
      existing.deviceName = deviceName?.trim() || existing.deviceName;
    }

    const target =
      existing ||
      new PatientDevice({
        patientId,
        caregiverId: req.user._id,
        deviceName: deviceName?.trim() || "Patient Device",
      });

    const { rawCode, pairingCodeExpiresAt } = await createPendingPairing(
      patientId,
      req.user._id,
      target
    );

    return res.status(201).json({
      success: true,
      message: "Pairing code generated. It expires in 15 minutes.",
      pairingCode: rawCode,
      expiresAt: pairingCodeExpiresAt,
    });
  } catch (error) {
    console.error("Setup patient device error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to set up patient device.",
    });
  }
};

/* ============================================================
   CAREGIVER: REGENERATE / RE-PAIR

   Invalidates any existing pending/active device for this
   patient and issues a brand new pairing code.

   POST /patient-devices/patient/:patientId/regenerate
============================================================ */

export const regeneratePatientDevice = async (req, res) => {
  try {
    const { patientId } = req.params;

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const existing = await PatientDevice.findOne({
      patientId,
      status: { $in: ["pending", "active"] },
    });

    const { rawCode, pairingCodeExpiresAt } = await createPendingPairing(
      patientId,
      req.user._id,
      existing
    );

    return res.status(200).json({
      success: true,
      message:
        "A new pairing code has been generated. Any previous device connection has been invalidated.",
      pairingCode: rawCode,
      expiresAt: pairingCodeExpiresAt,
    });
  } catch (error) {
    console.error("Regenerate patient device error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to regenerate patient device pairing.",
    });
  }
};

/* ============================================================
   CAREGIVER: GET PATIENT DEVICE STATUS

   GET /patient-devices/patient/:patientId
============================================================ */

export const getPatientDeviceStatus = async (req, res) => {
  try {
    const { patientId } = req.params;

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const device = await PatientDevice.findOne({
      patientId,
      status: { $in: ["pending", "active"] },
    }).sort({ createdAt: -1 });

    if (!device) {
      return res.status(200).json({
        success: true,
        deviceStatus: "not_connected",
      });
    }

    if (device.status === "pending") {
      const isExpired =
        !device.pairingCodeExpiresAt || device.pairingCodeExpiresAt <= new Date();

      return res.status(200).json({
        success: true,
        deviceStatus: isExpired ? "not_connected" : "pending",
        expiresAt: device.pairingCodeExpiresAt,
      });
    }

    return res.status(200).json({
      success: true,
      deviceStatus: "connected",
      device: {
        id: device._id,
        deviceName: device.deviceName,
        lastActiveAt: device.lastActiveAt,
        pairedAt: device.pairedAt,
      },
    });
  } catch (error) {
    console.error("Get patient device status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load patient device status.",
    });
  }
};

/* ============================================================
   CAREGIVER: REVOKE PATIENT DEVICE

   DELETE /patient-devices/patient/:patientId
============================================================ */

export const revokePatientDevice = async (req, res) => {
  try {
    const { patientId } = req.params;

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    const device = await PatientDevice.findOne({
      patientId,
      status: { $in: ["pending", "active"] },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "No connected or pending device found for this patient.",
      });
    }

    device.status = "revoked";
    device.deviceTokenHash = null;
    device.pairingCodeHash = null;
    device.pairingCodeExpiresAt = null;
    device.revokedAt = new Date();

    await device.save();

    return res.status(200).json({
      success: true,
      message: "Patient device revoked successfully.",
    });
  } catch (error) {
    console.error("Revoke patient device error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to revoke patient device.",
    });
  }
};

/* ============================================================
   DEVICE: REDEEM PAIRING CODE

   POST /patient-devices/redeem
   body: { pairingCode, deviceName? }

   PUBLIC endpoint — the patient device has no prior credentials,
   so this is intentionally unauthenticated. Security instead
   comes from the pairing code itself: cryptographically random,
   short-lived (15 min), and single-use (cleared immediately on
   success). No patient information beyond the internal
   patientId is ever returned here.
============================================================ */

export const redeemPairingCode = async (req, res) => {
  try {
    const { pairingCode, deviceName } = req.body;

    if (!pairingCode || typeof pairingCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "A pairing code is required.",
      });
    }

    const normalizedCode = pairingCode.trim().toUpperCase();
    const codeHash = hashValue(normalizedCode);

    const device = await PatientDevice.findOne({
      pairingCodeHash: codeHash,
      status: "pending",
    });

    if (!device) {
      return res.status(400).json({
        success: false,
        message: "Invalid pairing code.",
      });
    }

    if (
      !device.pairingCodeExpiresAt ||
      device.pairingCodeExpiresAt <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "This pairing code has expired.",
      });
    }

    const rawDeviceToken = generateDeviceToken();

    device.status = "active";
    device.deviceTokenHash = hashValue(rawDeviceToken);
    device.deviceName = deviceName?.trim() || device.deviceName;
    device.pairingCodeHash = null;
    device.pairingCodeExpiresAt = null;
    device.pairedAt = new Date();
    device.lastActiveAt = new Date();

    await device.save();

    /*
     * Only the patient's first name is returned here — enough
     * for the device to show a friendly confirmation screen,
     * without exposing email, phone, medical data, or any other
     * sensitive information through this unauthenticated
     * endpoint.
     */
    const patient = await User.findById(device.patientId).select(
      "fullName"
    );

    return res.status(200).json({
      success: true,
      message: "Device paired successfully.",
      deviceToken: rawDeviceToken,
      patientId: device.patientId,
      patientName: patient?.fullName || "",
    });
  } catch (error) {
    console.error("Redeem pairing code error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to pair device.",
    });
  }
};

/* ============================================================
   DEVICE: SESSION CHECK

   GET /patient-devices/session

   Authenticated via protectPatientDevice (not the normal JWT
   `protect` middleware). Proves the device-token -> patient
   resolution chain works. Intentionally returns only minimal,
   non-sensitive identity info — no dashboard data exists yet.
============================================================ */

export const getPatientDeviceSession = async (req, res) => {
  return res.status(200).json({
    success: true,
    patient: {
      id: req.patient._id,
      fullName: req.patient.fullName,
    },
    device: {
      id: req.patientDevice._id,
      deviceName: req.patientDevice.deviceName,
      lastActiveAt: req.patientDevice.lastActiveAt,
    },
  });
};

/* ============================================================
   PATIENT DEVICE — DATA ENDPOINTS

   Everything below is authenticated via protectPatientDevice
   (device token -> req.patient), NEVER via patientId supplied
   by the frontend. Every query below is scoped to
   req.patient._id only.
============================================================ */

/* ============================================================
   GET MY PROFILE

   GET /patient-devices/me

   Returns only the minimum information the Patient Dashboard
   needs — never password, email, phone, or other private data.
============================================================ */

export const getMyProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    patient: {
      fullName: req.patient.fullName,
    },
  });
};

/* ============================================================
   GET MY TODAY'S MEDICATIONS

   GET /patient-devices/me/medications/today

   Reuses the exact same schedule-computation logic as the
   caregiver endpoint (computeTodaysScheduleForPatient) — no
   duplicated business logic, just a different, patient-scoped
   entry point.
============================================================ */

export const getMyTodaysMedications = async (req, res) => {
  try {
    const schedule = await computeTodaysScheduleForPatient(
      req.patient._id
    );

    return res.status(200).json({
      success: true,
      date: todayKey(),
      schedule,
    });
  } catch (error) {
    console.error("Get my medications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load medications.",
    });
  }
};

/* ============================================================
   MARK MY MEDICATION AS TAKEN

   PATCH /patient-devices/me/medications/:medicationId/take

   The medication is looked up by patientId = req.patient._id —
   never trusted from the request. A patient device can only
   ever mark its own patient's medications.
============================================================ */

export const markMyMedicationTaken = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const { time } = req.body;

    if (!medicationId || !time || !TIME_REGEX.test(time)) {
      return res.status(400).json({
        success: false,
        message: "A valid medication and time (HH:mm) are required.",
      });
    }

    const medication = await Medication.findOne({
      _id: medicationId,
      patientId: req.patient._id,
    });

    if (!medication) {
      return res.status(404).json({
        success: false,
        message: "Medication not found.",
      });
    }

    if (!medication.times.includes(time)) {
      return res.status(400).json({
        success: false,
        message: "This time is not part of the medication schedule.",
      });
    }

    const log = await MedicationLog.findOneAndUpdate(
      {
        medicationId: medication._id,
        date: todayKey(),
        time,
      },
      {
        $set: {
          patientId: req.patient._id,
          status: "taken",
          takenAt: new Date(),
          takenBy: req.patient._id,
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Medication marked as taken.",
      log,
    });
  } catch (error) {
    console.error("Mark my medication taken error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update medication status.",
    });
  }
};

/* ============================================================
   GET MY DAILY TASKS

   GET /patient-devices/me/daily-tasks
============================================================ */

export const getMyDailyTasks = async (req, res) => {
  try {
    const tasks = await DailyTask.find({
      patientId: req.patient._id,
      isActive: true,
    })
      .sort({ scheduledTime: 1, createdAt: -1 })
      .lean();

    const completedCount = tasks.filter((task) => task.isCompleted).length;

    return res.status(200).json({
      success: true,
      tasks,
      summary: {
        total: tasks.length,
        completed: completedCount,
        pending: tasks.length - completedCount,
      },
    });
  } catch (error) {
    console.error("Get my daily tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load daily tasks.",
    });
  }
};

/* ============================================================
   COMPLETE MY DAILY TASK

   PATCH /patient-devices/me/daily-tasks/:taskId/complete

   The task is looked up by patientId = req.patient._id — never
   trusted from the request.
============================================================ */

export const completeMyDailyTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await DailyTask.findOne({
      _id: taskId,
      patientId: req.patient._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const completed =
      typeof req.body.completed === "boolean" ? req.body.completed : true;

    task.isCompleted = completed;
    task.completedAt = completed ? new Date() : null;
    task.completedBy = completed ? req.patient._id : null;

    await task.save();

    return res.status(200).json({
      success: true,
      message: completed
        ? "Task marked as completed."
        : "Task marked as pending.",
      task,
    });
  } catch (error) {
    console.error("Complete my daily task error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update task status.",
    });
  }
};

/* ============================================================
   SAVE MY COGNITIVE ACTIVITY RESULT

   POST /patient-devices/me/cognitive-activities

   Reuses the existing CognitiveActivity model — no duplicate
   model or storage created. caregiverId is resolved server-side
   from the patient's active CareAssignment when one exists.
============================================================ */

export const createMyCognitiveActivity = async (req, res) => {
  try {
    const { activityType, score, durationSeconds } = req.body;

    if (!activityType || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Activity type and score are required.",
      });
    }

    if (!ACTIVITY_TYPES.includes(activityType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity type.",
      });
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return res.status(400).json({
        success: false,
        message: "Score must be a number between 0 and 100.",
      });
    }

    const assignment = await CareAssignment.findOne({
      patientId: req.patient._id,
      status: "active",
    });

    const activity = await CognitiveActivity.create({
      patientId: req.patient._id,
      caregiverId: assignment?.caregiverId || null,
      createdBy: req.patient._id,
      activityType,
      score: numericScore,
      durationSeconds: durationSeconds ? Number(durationSeconds) : null,
    });

    return res.status(201).json({
      success: true,
      message: "Activity result saved successfully.",
      activity,
    });
  } catch (error) {
    console.error("Create my cognitive activity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save activity result.",
    });
  }
};

/* ============================================================
   GET MY COGNITIVE ACTIVITY STATUS (today)

   GET /patient-devices/me/cognitive-activities/today
============================================================ */

export const getMyCognitiveActivityToday = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const completedToday = await CognitiveActivity.findOne({
      patientId: req.patient._id,
      createdAt: { $gte: startOfDay },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      completedToday: Boolean(completedToday),
      latest: completedToday || null,
    });
  } catch (error) {
    console.error("Get my cognitive activity status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load cognitive activity status.",
    });
  }
};

/* ============================================================
   REQUEST HELP

   POST /patient-devices/me/help

   Reuses the EXISTING Notification system — no new model. A
   Notification is created for every caregiver actively assigned
   to this patient (via CareAssignment), so it shows up through
   the caregiver's existing notification/alert UI unchanged.
============================================================ */

export const requestHelp = async (req, res) => {
  try {
    const assignments = await CareAssignment.find({
      patientId: req.patient._id,
      status: "active",
    });

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No caregiver is currently assigned to this patient.",
      });
    }

    await Notification.insertMany(
      assignments.map((assignment) => ({
        recipientId: assignment.caregiverId,
        patientId: req.patient._id,
        title: "Help Requested",
        message: `${req.patient.fullName} has requested help.`,
        type: "critical",
      }))
    );

    return res.status(201).json({
      success: true,
      message: "Help request sent to your caregiver.",
    });
  } catch (error) {
    console.error("Request help error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send help request.",
    });
  }
};

/* ============================================================
   UPDATE MY LOCATION (GPS foundation only)

   POST /patient-devices/me/location
   body: { latitude, longitude }

   Stores only the single latest point on this device's own
   PatientDevice document — never fabricated, never derived from
   anything but a real browser geolocation reading reported by
   this authenticated device.
============================================================ */

export const updateMyLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid latitude and longitude are required.",
      });
    }

    req.patientDevice.lastKnownLocation = {
      latitude: lat,
      longitude: lng,
      updatedAt: new Date(),
    };

    await req.patientDevice.save();

    return res.status(200).json({
      success: true,
      message: "Location updated.",
    });
  } catch (error) {
    console.error("Update my location error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update location.",
    });
  }
};

/* POST /patient-devices/face-recognition — patient is derived from device token. */
export const recognizeMyFamilyMember = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Please capture a clear face photo." });
    const familyMembers = await FamilyMember.find({ patientId: req.patient._id, faceProfileRegistered: true })
      .select("+faceEmbedding name relationship")
      .lean();
    if (!familyMembers.length) return res.status(404).json({ success: false, message: "No family members have been registered yet." });

    const { embedding } = await generateFaceEmbedding(req.file);
    const { bestMatch, recognized } = recognizeFace(embedding, familyMembers);
    const event = await FaceRecognitionEvent.create({
      patientId: req.patient._id,
      familyMemberId: recognized ? bestMatch.member._id : null,
      deviceId: req.patientDevice._id,
      recognized,
      distance: bestMatch?.distance ?? null,
    });
    if (!recognized) {
      const assignments = await CareAssignment.find({ patientId: req.patient._id, status: "active" }).select("caregiverId").lean();
      if (assignments.length) await Notification.insertMany(assignments.map(({ caregiverId }) => ({
        recipientId: caregiverId, patientId: req.patient._id,
        title: "Unknown Person Detected", message: `Unknown person detected near ${req.patient.fullName}.`,
        type: "warning", referenceId: event._id, referenceType: "system",
      })));
      return res.status(200).json({ success: true, recognized: false, message: "Person not recognized." });
    }
    return res.status(200).json({
      success: true, recognized: true, familyMemberId: bestMatch.member._id,
      name: bestMatch.member.name, relationship: bestMatch.member.relationship,
      similarity: Number((1 - bestMatch.distance / 2).toFixed(3)),
    });
  } catch (error) {
    if (error instanceof FaceRecognitionServiceError) return res.status(error.status).json({ success: false, message: error.message });
    console.error("Face recognition error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to recognize this person right now." });
  }
};
