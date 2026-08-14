import mongoose from "mongoose";

import User from "../models/User.js";
import CareAssignment from "../models/CareAssignment.js";

/* ============================================================
   GET ALL PATIENTS
   Doctor can view registered patients
============================================================ */

export const getPatientsForAssignment = async (
  req,
  res
) => {
  try {
    const patients = await User.find({
      role: "patient",
    })
      .select(
        "fullName age gender email phone profilePicture"
      )
      .sort({
        fullName: 1,
      })
      .lean();

    /* --------------------------------------------------------
       FIND ASSIGNMENTS BELONGING TO CURRENT DOCTOR
    -------------------------------------------------------- */

    const assignments =
      await CareAssignment.find({
        doctorId: req.user._id,
      })
        .populate({
          path: "caregiverId",
          select:
            "fullName email phone relationship profilePicture",
        })
        .lean();

    /* --------------------------------------------------------
       CREATE PATIENT → ASSIGNMENT LOOKUP
    -------------------------------------------------------- */

    const assignmentMap =
      new Map();

    assignments.forEach(
      (assignment) => {
        assignmentMap.set(
          assignment.patientId.toString(),
          assignment
        );
      }
    );

    /* --------------------------------------------------------
       COMBINE PATIENT + ASSIGNMENT DATA
    -------------------------------------------------------- */

    const patientsWithAssignments =
      patients.map((patient) => {
        const assignment =
          assignmentMap.get(
            patient._id.toString()
          );

        return {
          ...patient,

          caregiver:
            assignment?.caregiverId || null,

          assignment: assignment
            ? {
                id: assignment._id,
                status:
                  assignment.status,
                createdAt:
                  assignment.createdAt,
              }
            : null,
        };
      });

    return res.status(200).json({
      success: true,
      patients:
        patientsWithAssignments,
    });
  } catch (error) {
    console.error(
      "Get patients error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load patients.",
    });
  }
};

/* ============================================================
   GET ALL CAREGIVERS
   Doctor can view registered caregivers
============================================================ */

export const getCaregiversForAssignment =
  async (req, res) => {
    try {
      const caregivers = await User.find({
        role: "caregiver",
      })
        .select(
          "fullName email phone relationship profilePicture"
        )
        .sort({
          fullName: 1,
        });

      return res.status(200).json({
        success: true,
        caregivers,
      });
    } catch (error) {
      console.error(
        "Get caregivers error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load caregivers.",
      });
    }
  };

/* ============================================================
   ASSIGN PATIENT TO CAREGIVER
============================================================ */

export const assignPatientToCaregiver =
  async (req, res) => {
    try {
      const {
        patientId,
        caregiverId,
      } = req.body;

      /* --------------------------------------------------------
         VALIDATION
      -------------------------------------------------------- */

      if (
        !patientId ||
        !caregiverId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Patient and caregiver are required.",
        });
      }

      if (
        !mongoose.isValidObjectId(
          patientId
        ) ||
        !mongoose.isValidObjectId(
          caregiverId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient or caregiver ID.",
        });
      }

      /* --------------------------------------------------------
         VERIFY PATIENT
      -------------------------------------------------------- */

      const patient =
        await User.findOne({
          _id: patientId,
          role: "patient",
        }).select(
          "fullName age gender email phone profilePicture"
        );

      if (!patient) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found.",
        });
      }

      /* --------------------------------------------------------
         VERIFY CAREGIVER
      -------------------------------------------------------- */

      const caregiver =
        await User.findOne({
          _id: caregiverId,
          role: "caregiver",
        }).select(
          "fullName email phone relationship profilePicture"
        );

      if (!caregiver) {
        return res.status(404).json({
          success: false,
          message:
            "Caregiver not found.",
        });
      }

      /* --------------------------------------------------------
         CHECK CURRENT ACTIVE ASSIGNMENT
      -------------------------------------------------------- */

      const currentAssignment =
        await CareAssignment.findOne({
          patientId,
          status: "active",
        });

      /* --------------------------------------------------------
         SAME PATIENT + SAME CAREGIVER
      -------------------------------------------------------- */

      if (
        currentAssignment &&
        currentAssignment.caregiverId.toString() ===
          caregiverId
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This patient is already assigned to this caregiver.",
        });
      }

      /* --------------------------------------------------------
         REASSIGN PATIENT
         
         If the patient currently belongs
         to another caregiver, deactivate
         the old assignment first.
      -------------------------------------------------------- */

      if (currentAssignment) {
        currentAssignment.status =
          "inactive";

        await currentAssignment.save();
      }

      /* --------------------------------------------------------
         CREATE NEW ACTIVE ASSIGNMENT
      -------------------------------------------------------- */

      const assignment =
        await CareAssignment.create({
          patientId,
          caregiverId,
          doctorId: req.user._id,
          status: "active",
        });

      /* --------------------------------------------------------
         RETURN POPULATED ASSIGNMENT
      -------------------------------------------------------- */

      const populatedAssignment =
        await CareAssignment.findById(
          assignment._id
        )
          .populate({
            path: "patientId",
            select:
              "fullName age gender email phone profilePicture",
          })
          .populate({
            path: "caregiverId",
            select:
              "fullName email phone relationship profilePicture",
          })
          .populate({
            path: "doctorId",
            select:
              "fullName email phone doctorDetails profilePicture",
          });

      return res.status(201).json({
        success: true,
        message:
          "Patient assigned to caregiver successfully.",
        assignment:
          populatedAssignment,
      });
    } catch (error) {
      console.error(
        "Assign patient error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to assign patient.",
      });
    }
  };