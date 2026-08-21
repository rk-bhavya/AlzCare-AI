import mongoose from "mongoose";

import ClinicalNote from "../models/ClinicalNote.js";
import User from "../models/User.js";


/* ============================================================
   CREATE CLINICAL NOTE
============================================================ */

export const createClinicalNote =
  async (req, res) => {

    try {

      const {
        patientId,
        note,
      } = req.body;


      if (
        !patientId ||
        !note?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Patient and clinical note are required.",
        });
      }


      if (
        !mongoose.isValidObjectId(
          patientId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID.",
        });
      }


      const patient =
        await User.findOne({
          _id: patientId,
          role: "patient",
        });


      if (!patient) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found.",
        });
      }


      const clinicalNote =
        await ClinicalNote.create({
          doctorId:
            req.user._id,

          patientId:
            patientId,

          note:
            note.trim(),
        });


      const populatedNote =
        await ClinicalNote.findById(
          clinicalNote._id
        )
          .populate({
            path: "doctorId",
            select:
              "fullName email profilePicture",
          })
          .populate({
            path: "patientId",
            select:
              "fullName age gender profilePicture",
          })
          .lean();


      return res.status(201).json({
        success: true,
        message:
          "Clinical note saved successfully.",
        note:
          populatedNote,
      });

    } catch (error) {

      console.error(
        "Create clinical note error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to save clinical note.",
      });
    }
  };


/* ============================================================
   GET PATIENT CLINICAL NOTES
============================================================ */

export const getPatientClinicalNotes =
  async (req, res) => {

    try {

      const {
        patientId,
      } = req.params;


      if (
        !mongoose.isValidObjectId(
          patientId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID.",
        });
      }


      const patient =
        await User.findOne({
          _id: patientId,
          role: "patient",
        });


      if (!patient) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found.",
        });
      }


      const notes =
        await ClinicalNote.find({
          doctorId:
            req.user._id,

          patientId,
        })
          .populate({
            path: "doctorId",
            select:
              "fullName email profilePicture",
          })
          .populate({
            path: "patientId",
            select:
              "fullName age gender profilePicture",
          })
          .sort({
            createdAt: -1,
          })
          .lean();


      return res.status(200).json({
        success: true,
        notes,
      });

    } catch (error) {

      console.error(
        "Get clinical notes error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load clinical notes.",
      });
    }
  };