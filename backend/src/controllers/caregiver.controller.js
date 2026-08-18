import mongoose from "mongoose";

import User from "../models/User.js";
import CareAssignment from "../models/CareAssignment.js";
import Appointment from "../models/Appointment.js";
import Assessment from "../models/Assessment.js";
import Notification from "../models/Notification.js";
import Medication from "../models/Medication.js";
import MedicationLog from "../models/MedicationLog.js";

/* ============================================================
   SHARED HELPER

   Verifies that the currently authenticated caregiver has an
   ACTIVE care assignment for the given patient. Never trust a
   patientId sent from the frontend without this check.
============================================================ */

export const verifyCaregiverOwnsPatient = async (
  caregiverId,
  patientId
) => {
  if (!mongoose.isValidObjectId(patientId)) {
    return null;
  }

  const assignment = await CareAssignment.findOne({
    caregiverId,
    patientId,
    status: "active",
  });

  return assignment;
};

/* ============================================================
   GET CAREGIVER DASHBOARD
============================================================ */

export const getCaregiverDashboard = async (
  req,
  res
) => {
  try {
    /* --------------------------------------------------------
       AUTHENTICATED CAREGIVER
    -------------------------------------------------------- */

    const caregiver = req.user;

    /* --------------------------------------------------------
       SAFETY CHECK
    -------------------------------------------------------- */

    if (caregiver.role !== "caregiver") {
      return res.status(403).json({
        success: false,
        message:
          "Only caregivers can access this dashboard.",
      });
    }

    /* --------------------------------------------------------
       FIND ACTIVE CARE ASSIGNMENT
    -------------------------------------------------------- */

    const assignment =
      await CareAssignment.findOne({
        caregiverId: caregiver._id,
        status: "active",
      })
        .populate({
          path: "patientId",
          select:
            "fullName age gender email phone address emergencyContact relationship profilePicture",
        })
        .populate({
          path: "doctorId",
          select:
            "fullName email phone address doctorDetails profilePicture",
        });

    /* --------------------------------------------------------
       NO PATIENT ASSIGNED
    -------------------------------------------------------- */

    if (!assignment) {
      return res.status(200).json({
        success: true,

        caregiver: {
          id: caregiver._id,
          fullName: caregiver.fullName,
          email: caregiver.email,
          phone: caregiver.phone,
          relationship: caregiver.relationship,
          profilePicture:
            caregiver.profilePicture,
        },

        patient: null,

        doctor: null,

        assignment: null,

        message:
          "No patient has been assigned to you yet.",
      });
    }

    /* --------------------------------------------------------
       RETURN DASHBOARD DATA
    -------------------------------------------------------- */

    return res.status(200).json({
      success: true,

      caregiver: {
        id: caregiver._id,
        fullName: caregiver.fullName,
        email: caregiver.email,
        phone: caregiver.phone,
        relationship: caregiver.relationship,
        profilePicture:
          caregiver.profilePicture,
      },

      patient: assignment.patientId,

      doctor: assignment.doctorId,

      assignment: {
        id: assignment._id,
        status: assignment.status,
        createdAt:
          assignment.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Caregiver dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load caregiver dashboard.",
    });
  }
};

/* ============================================================
   GET ALL CAREGIVER PATIENTS

   Returns every patient with an ACTIVE care assignment to the
   logged-in caregiver, enriched with their latest AI assessment.

   Only ever filters by req.user._id — never trusts a caregiver
   id from the frontend.
============================================================ */

export const getCaregiverPatients = async (req, res) => {
  try {
    const assignments = await CareAssignment.find({
      caregiverId: req.user._id,
      status: "active",
    })
      .populate({
        path: "patientId",
        select:
          "fullName age gender email phone address emergencyContact profilePicture createdAt",
      })
      .populate({
        path: "doctorId",
        select: "fullName doctorDetails",
      })
      .sort({ createdAt: -1 })
      .lean();

    const patients = await Promise.all(
      assignments
        .filter((assignment) => assignment.patientId)
        .map(async (assignment) => {
          const latestAssessment = await Assessment.findOne({
            patientId: assignment.patientId._id,
          })
            .sort({ createdAt: -1 })
            .select("prediction confidence createdAt")
            .lean();

          return {
            ...assignment.patientId,
            doctor: assignment.doctorId || null,
            assignment: {
              id: assignment._id,
              status: assignment.status,
              createdAt: assignment.createdAt,
            },
            latestAssessment: latestAssessment || null,
          };
        })
    );

    return res.status(200).json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error("Get caregiver patients error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load your patients.",
    });
  }
};

/* ============================================================
   GET CAREGIVER PATIENT DETAILS

   /caregiver/patients/:patientId

   Ownership is verified through CareAssignment before any
   data is returned.
============================================================ */

export const getCaregiverPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID.",
      });
    }

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message:
          "This patient is not assigned to your care.",
      });
    }

    const patient = await User.findOne({
      _id: patientId,
      role: "patient",
    }).select("-password");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    const doctor = await User.findById(assignment.doctorId).select(
      "fullName email phone doctorDetails profilePicture"
    );

    const [assessments, medications, appointments, alerts] =
      await Promise.all([
        Assessment.find({ patientId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),

        Medication.find({ patientId, isActive: true })
          .sort({ createdAt: -1 })
          .lean(),

        Appointment.find({ patientId })
          .sort({ appointmentDate: -1 })
          .limit(10)
          .populate({
            path: "doctorId",
            select: "fullName doctorDetails",
          })
          .lean(),

        Notification.find({
          recipientId: req.user._id,
          patientId,
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    return res.status(200).json({
      success: true,
      patient,
      doctor,
      assessments,
      medications,
      appointments,
      alerts,
    });
  } catch (error) {
    console.error("Get caregiver patient details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load patient details.",
    });
  }
};

/* ============================================================
   GET CAREGIVER DASHBOARD SUMMARY

   Returns the four dashboard summary card values plus today's
   medications/appointments and recent alerts, all computed from
   real data across every patient assigned to this caregiver.
============================================================ */

export const getCaregiverDashboardSummary = async (req, res) => {
  try {
    const caregiverId = req.user._id;

    const assignments = await CareAssignment.find({
      caregiverId,
      status: "active",
    }).lean();

    const patientIds = assignments.map(
      (assignment) => assignment.patientId
    );

    /* -------------------------------------------------------
       TODAY'S DATE WINDOW
    ------------------------------------------------------- */

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const todayKey = startOfDay.toISOString().slice(0, 10);

    /* -------------------------------------------------------
       TODAY'S APPOINTMENTS
    ------------------------------------------------------- */

    const todaysAppointments = patientIds.length
      ? await Appointment.find({
          patientId: { $in: patientIds },
          appointmentDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ["scheduled", "rescheduled"] },
        })
          .populate({ path: "patientId", select: "fullName profilePicture" })
          .populate({ path: "doctorId", select: "fullName doctorDetails" })
          .sort({ appointmentDate: 1 })
          .lean()
      : [];

    /* -------------------------------------------------------
       TODAY'S MEDICATIONS (from active schedules + logs)
    ------------------------------------------------------- */

    const activeMedications = patientIds.length
      ? await Medication.find({
          patientId: { $in: patientIds },
          isActive: true,
          startDate: { $lte: endOfDay },
          $or: [{ endDate: null }, { endDate: { $gte: startOfDay } }],
        })
          .populate({ path: "patientId", select: "fullName profilePicture" })
          .lean()
      : [];

    const medicationIds = activeMedications.map((med) => med._id);

    const todaysLogs = medicationIds.length
      ? await MedicationLog.find({
          medicationId: { $in: medicationIds },
          date: todayKey,
        }).lean()
      : [];

    const logMap = new Map(
      todaysLogs.map((log) => [`${log.medicationId}_${log.time}`, log])
    );

    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const todaysMedications = [];

    activeMedications.forEach((medication) => {
      medication.times.forEach((time) => {
        const log = logMap.get(`${medication._id}_${time}`);

        const [hours, minutes] = time.split(":").map(Number);
        const scheduledMinutes = hours * 60 + minutes;

        let status = "pending";

        if (log) {
          status = log.status;
        } else if (scheduledMinutes < nowMinutes) {
          status = "missed";
        }

        todaysMedications.push({
          medicationId: medication._id,
          patient: medication.patientId,
          name: medication.name,
          dosage: medication.dosage,
          time,
          status,
        });
      });
    });

    todaysMedications.sort((a, b) => a.time.localeCompare(b.time));

    /* -------------------------------------------------------
       ACTIVE ALERTS (unread notifications for this caregiver)
    ------------------------------------------------------- */

    const alerts = await Notification.find({
      recipientId: caregiverId,
    })
      .populate({ path: "patientId", select: "fullName profilePicture" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const activeAlertCount = await Notification.countDocuments({
      recipientId: caregiverId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      summary: {
        patientCount: patientIds.length,
        todaysMedicationCount: todaysMedications.length,
        todaysAppointmentCount: todaysAppointments.length,
        activeAlertCount,
      },
      todaysMedications,
      todaysAppointments,
      alerts,
    });
  } catch (error) {
    console.error("Get caregiver dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard summary.",
    });
  }
};

/* ============================================================
   GET CAREGIVER PROFILE
============================================================ */

export const getCaregiverProfile = async (req, res) => {
  try {
    const caregiver = await User.findOne({
      _id: req.user._id,
      role: "caregiver",
    }).select("-password");

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: "Caregiver profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      caregiver,
    });
  } catch (error) {
    console.error("Get caregiver profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load caregiver profile.",
    });
  }
};

/* ============================================================
   UPDATE CAREGIVER PROFILE

   Editable: fullName, phone, address, relationship
   NOT editable: role, email, patient ownership
============================================================ */

export const updateCaregiverProfile = async (req, res) => {
  try {
    const { fullName, phone, address, relationship } = req.body;

    if (!fullName || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone, and address are required.",
      });
    }

    const caregiver = await User.findOne({
      _id: req.user._id,
      role: "caregiver",
    });

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: "Caregiver profile not found.",
      });
    }

    caregiver.fullName = fullName.trim();
    caregiver.phone = phone.trim();
    caregiver.address = address.trim();

    if (relationship) {
      caregiver.relationship = relationship;
    }

    await caregiver.save();

    const updatedCaregiver = await User.findById(caregiver._id).select(
      "-password"
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      caregiver: updatedCaregiver,
    });
  } catch (error) {
    console.error("Update caregiver profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};

/* ============================================================
   GET CAREGIVER MONITORING

   Returns whatever real monitoring information exists for each
   assigned patient. This system does not integrate with any
   GPS hardware, so location is honestly reported as
   "unavailable" rather than faked.
============================================================ */

export const getCaregiverMonitoring = async (req, res) => {
  try {
    const assignments = await CareAssignment.find({
      caregiverId: req.user._id,
      status: "active",
    })
      .populate({
        path: "patientId",
        select: "fullName age gender profilePicture updatedAt",
      })
      .lean();

    const monitoring = await Promise.all(
      assignments
        .filter((assignment) => assignment.patientId)
        .map(async (assignment) => {
          const patientId = assignment.patientId._id;

          const latestAssessment = await Assessment.findOne({ patientId })
            .sort({ createdAt: -1 })
            .select("prediction confidence createdAt")
            .lean();

          const unreadAlerts = await Notification.countDocuments({
            recipientId: req.user._id,
            patientId,
            isRead: false,
          });

          return {
            patient: assignment.patientId,
            latestAssessment: latestAssessment || null,
            activeAlertCount: unreadAlerts,
            location: {
              status: "unavailable",
              message:
                "Live location tracking is not connected for this patient.",
            },
            lastKnownActivity: assignment.patientId.updatedAt || null,
          };
        })
    );

    return res.status(200).json({
      success: true,
      monitoring,
    });
  } catch (error) {
    console.error("Get caregiver monitoring error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load monitoring information.",
    });
  }
};
