import User from "../models/User.js";
import CareAssignment from "../models/CareAssignment.js";

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