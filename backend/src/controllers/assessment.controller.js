import mongoose from "mongoose";

import Assessment from "../models/Assessment.js";
import User from "../models/User.js";
import CareAssignment from "../models/CareAssignment.js";
import Notification from "../models/Notification.js";

/* ============================================================
   MODEL API
============================================================ */

const MODEL_API_URL =
  process.env.MODEL_API_URL ||
  "http://127.0.0.1:8000";


/* ============================================================
   CREATE AI ASSESSMENT

   BOTH DOCTOR AND CAREGIVER CAN CREATE ASSESSMENTS.

   Doctor:
   - Can assess patients assigned to the doctor.

   Caregiver:
   - Can assess the caregiver's currently assigned patient.

   Flow:

   React
      ↓
   Node / Express
      ↓
   FastAPI
      ↓
   EfficientNetB0
      ↓
   Prediction
      ↓
   MongoDB
============================================================ */

export const createAssessment = async (
  req,
  res
) => {

  try {

    /* --------------------------------------------------------
       VERIFY USER ROLE
    -------------------------------------------------------- */

    if (
      !req.user ||
      !["doctor", "caregiver"].includes(
        req.user.role
      )
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Only doctors and caregivers can create AI assessments.",
      });

    }


    /* --------------------------------------------------------
       GET REQUEST DATA
    -------------------------------------------------------- */

    const {
      patientId,
      notes = "",
    } = req.body;


    /* --------------------------------------------------------
       VALIDATE PATIENT ID
    -------------------------------------------------------- */

    if (!patientId) {

      return res.status(400).json({
        success: false,
        message:
          "Patient ID is required.",
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


    /* --------------------------------------------------------
       VERIFY PATIENT
    -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       FIND ACTIVE CARE ASSIGNMENT
    -------------------------------------------------------- */

    let assignment;


    if (
      req.user.role === "doctor"
    ) {

      /*
       * Doctor can assess a patient assigned
       * to that doctor.
       */

      assignment =
        await CareAssignment.findOne({
          patientId,

          doctorId:
            req.user._id,

          status:
            "active",
        });

    } else {

      /*
       * Caregiver can assess only their
       * currently assigned patient.
       */

      assignment =
        await CareAssignment.findOne({
          patientId,

          caregiverId:
            req.user._id,

          status:
            "active",
        });

    }


    /* --------------------------------------------------------
       VERIFY ASSIGNMENT
    -------------------------------------------------------- */

    if (!assignment) {

      return res.status(403).json({
        success: false,
        message:
          "This patient is not currently assigned to you.",
      });

    }


    /* --------------------------------------------------------
       IMAGE CHECK
    -------------------------------------------------------- */

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message:
          "MRI or CT image is required.",
      });

    }


    /* ========================================================
       SEND IMAGE TO FASTAPI MODEL
    ======================================================== */

    const modelFormData =
      new FormData();


    const imageBlob =
      new Blob(
        [req.file.buffer],
        {
          type:
            req.file.mimetype ||
            "image/jpeg",
        }
      );


    modelFormData.append(
      "file",
      imageBlob,
      req.file.originalname ||
        "medical-image.jpg"
    );


    let modelResponse;


    try {

      modelResponse =
        await fetch(
          `${MODEL_API_URL}/predict`,
          {
            method: "POST",
            body: modelFormData,
          }
        );

    } catch (modelError) {

      console.error(
        "Model API connection error:",
        modelError
      );

      return res.status(503).json({
        success: false,
        message:
          "AI model service is unavailable. Please make sure the model server is running.",
      });

    }


    /* ========================================================
       READ MODEL RESPONSE
    ======================================================== */

    let modelData;


    try {

      modelData =
        await modelResponse.json();

    } catch (parseError) {

      console.error(
        "Invalid model response:",
        parseError
      );

      return res.status(502).json({
        success: false,
        message:
          "Invalid response received from AI model.",
      });

    }


    /* ========================================================
       HANDLE MODEL ERROR
    ======================================================== */

    if (
      !modelResponse.ok ||
      !modelData.success
    ) {

      console.error(
        "Model prediction failed:",
        modelData
      );

      return res.status(502).json({
        success: false,
        message:
          modelData.detail ||
          "Please enter a valid MRI image.",
      });

    }


    /* ========================================================
       GET AI RESULT
    ======================================================== */

    const prediction =
      modelData.prediction;


    const confidence =
      Number(
        modelData.confidence
      );


    const modelProbabilities =
      modelData.probabilities ||
      {};


    /* ========================================================
       CONVERT PROBABILITY KEYS

       MODEL API → MONGODB
    ======================================================== */

    const probabilities = {

      nonDemented:
        Number(
          modelProbabilities[
            "Non Demented"
          ] || 0
        ),

      veryMildDementia:
        Number(
          modelProbabilities[
            "Very Mild Dementia"
          ] || 0
        ),

      mildDementia:
        Number(
          modelProbabilities[
            "Mild Dementia"
          ] || 0
        ),

      moderateDementia:
        Number(
          modelProbabilities[
            "Moderate Dementia"
          ] || 0
        ),

    };


    /* ========================================================
       CREATE ASSESSMENT
    ======================================================== */

    const assessment =
      await Assessment.create({

        patientId,

        /*
         * Doctor responsible for the patient.
         */

        doctorId:
          assignment.doctorId,


        /*
         * Caregiver assigned at the time
         * of assessment.
         */

        caregiverId:
          assignment.caregiverId,


        /*
         * Actual person who performed
         * the assessment.
         *
         * Can be doctor OR caregiver.
         */

        createdBy:
          req.user._id,


        /*
         * Image storage can be connected
         * later.
         */

        image: {

          url: "",

          publicId: "",

        },


        prediction,

        confidence,

        probabilities,

        notes,


        model: {

          name:
            modelData.model?.name ||
            "EfficientNetB0",

          version:
            "1.0",

        },

      });

      /* ============================================================
   CREATE DOCTOR NOTIFICATION
============================================================ */

try {

  await Notification.create({
    recipientId:
      assignment.doctorId,

    patientId:
      patientId,

    title:
      "New AI Assessment Available",

    message:
      `A new AI assessment has been completed for ${patient.fullName}. Prediction: ${prediction}.`,

    type:
      prediction === "Moderate Dementia"
        ? "critical"
        : prediction === "Mild Dementia"
        ? "warning"
        : "info",

    referenceId:
      assessment._id,

    referenceType:
      "assessment",

    isRead:
      false,
  });

} catch (notificationError) {

  /*
   * Do NOT fail the AI assessment if
   * notification creation fails.
   */

  console.error(
    "Unable to create assessment notification:",
    notificationError
  );

}

    /* ========================================================
       POPULATE ASSESSMENT
    ======================================================== */

    const populatedAssessment =
      await Assessment.findById(
        assessment._id
      )

        .populate({
          path: "patientId",

          select:
            "fullName age gender email phone profilePicture",
        })

        .populate({
          path: "doctorId",

          select:
            "fullName email phone doctorDetails profilePicture",
        })

        .populate({
          path: "caregiverId",

          select:
            "fullName email phone relationship profilePicture",
        })

        .populate({
          path: "createdBy",

          select:
            "fullName email role profilePicture",
        });


    /* ========================================================
       RESPONSE
    ======================================================== */

    return res.status(201).json({

      success: true,

      message:
        "AI assessment completed successfully.",

      assessment:
        populatedAssessment,

    });

  } catch (error) {

    console.error(
      "Create assessment error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Unable to create AI assessment.",

    });

  }

};


/* ============================================================
   GET PATIENT ASSESSMENT HISTORY

   BOTH DOCTOR AND CAREGIVER CAN VIEW HISTORY.

   Doctor:
   - Only their assigned patients.

   Caregiver:
   - Only their assigned patient.
============================================================ */

export const getPatientAssessments =
  async (
    req,
    res
  ) => {

    try {

      const {
        patientId,
      } = req.params;


      /* ------------------------------------------------------
         VALIDATE PATIENT ID
      ------------------------------------------------------ */

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


      /* ------------------------------------------------------
         FIND ACTIVE ASSIGNMENT
      ------------------------------------------------------ */

      let assignment;


      if (
        req.user.role === "doctor"
      ) {

        assignment =
          await CareAssignment.findOne({
            patientId,

            doctorId:
              req.user._id,

            status:
              "active",
          });

      } else if (
        req.user.role === "caregiver"
      ) {

        assignment =
          await CareAssignment.findOne({
            patientId,

            caregiverId:
              req.user._id,

            status:
              "active",
          });

      } else {

        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to view assessments.",
        });

      }


      /* ------------------------------------------------------
         VERIFY ACCESS
      ------------------------------------------------------ */

      if (!assignment) {

        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this patient's assessments.",
        });

      }


      /* ------------------------------------------------------
         GET ASSESSMENTS
      ------------------------------------------------------ */

      const assessments =
        await Assessment.find({
          patientId,
        })

          .populate({
            path: "doctorId",

            select:
              "fullName email doctorDetails profilePicture",
          })

          .populate({
            path: "caregiverId",

            select:
              "fullName email phone relationship profilePicture",
          })

          .populate({
            path: "createdBy",

            select:
              "fullName email role profilePicture",
          })

          .sort({
            createdAt: -1,
          });


      /* ------------------------------------------------------
         RESPONSE
      ------------------------------------------------------ */

      return res.status(200).json({

        success: true,

        count:
          assessments.length,

        assessments,

      });

    } catch (error) {

      console.error(
        "Get assessment history error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load assessment history.",

      });

    }

  };


/* ============================================================
   GET LATEST ASSESSMENT FOR LOGGED-IN DOCTOR

   Returns the most recent AI assessment
   for this doctor's patients.
============================================================ */

export const getLatestDoctorAssessment =
  async (
    req,
    res
  ) => {

    try {

      /* --------------------------------------------------------
         VERIFY DOCTOR
      -------------------------------------------------------- */

      if (
        !req.user ||
        req.user.role !== "doctor"
      ) {

        return res.status(403).json({
          success: false,
          message:
            "Only doctors can access this information.",
        });

      }


      /* --------------------------------------------------------
         FIND LATEST ASSESSMENT
      -------------------------------------------------------- */

      const assessment =
        await Assessment.findOne({

          doctorId:
            req.user._id,

        })

          .populate({
            path: "patientId",

            select:
              "fullName age gender profilePicture",
          })

          .populate({
            path: "createdBy",

            select:
              "fullName role profilePicture",
          })

          .populate({
            path: "caregiverId",

            select:
              "fullName email phone relationship profilePicture",
          })

          .sort({
            createdAt: -1,
          })

          .lean();


      /* --------------------------------------------------------
         NO ASSESSMENTS YET
      -------------------------------------------------------- */

      if (!assessment) {

        return res.status(200).json({

          success: true,

          assessment: null,

        });

      }


      /* --------------------------------------------------------
         RESPONSE
      -------------------------------------------------------- */

      return res.status(200).json({

        success: true,

        assessment,

      });

    } catch (error) {

      console.error(
        "Get latest doctor assessment error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load latest assessment.",

      });

    }

  };


/* ============================================================
   GET ASSESSMENT COUNT FOR LOGGED-IN DOCTOR

   Returns total number of AI assessments
   for this doctor's patients.
============================================================ */

export const getDoctorAssessmentCount =
  async (
    req,
    res
  ) => {

    try {

      /* --------------------------------------------------------
         VERIFY DOCTOR
      -------------------------------------------------------- */

      if (
        !req.user ||
        req.user.role !== "doctor"
      ) {

        return res.status(403).json({
          success: false,
          message:
            "Only doctors can access assessment statistics.",
        });

      }


      /* --------------------------------------------------------
         COUNT ASSESSMENTS
      -------------------------------------------------------- */

      const count =
        await Assessment.countDocuments({

          doctorId:
            req.user._id,

        });


      /* --------------------------------------------------------
         RESPONSE
      -------------------------------------------------------- */

      return res.status(200).json({

        success: true,

        count,

      });

    } catch (error) {

      console.error(
        "Get doctor assessment count error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load assessment count.",

      });

    }

  };


/* ============================================================
   GET PATIENTS NEEDING ATTENTION

   A patient needs attention when their LATEST
   assessment is:

   - Mild Dementia
   - Moderate Dementia

   Only the logged-in doctor's patients
   are considered.
============================================================ */

export const getDoctorPatientsNeedingAttention =
  async (
    req,
    res
  ) => {

    try {

      /* --------------------------------------------------------
         VERIFY DOCTOR
      -------------------------------------------------------- */

      if (
        !req.user ||
        req.user.role !== "doctor"
      ) {

        return res.status(403).json({
          success: false,
          message:
            "Only doctors can access this information.",
        });

      }


      /* --------------------------------------------------------
         GET DOCTOR'S ASSIGNED PATIENTS
      -------------------------------------------------------- */

      const assignments =
        await CareAssignment.find({

          doctorId:
            req.user._id,

          status:
            "active",

        })

          .select(
            "patientId"
          )

          .lean();


      const patientIds =
        assignments.map(
          (assignment) =>
            assignment.patientId
        );


      /* --------------------------------------------------------
         NO PATIENTS
      -------------------------------------------------------- */

      if (
        patientIds.length === 0
      ) {

        return res.status(200).json({

          success: true,

          count: 0,

          patients: [],

        });

      }


      /* --------------------------------------------------------
         GET ALL ASSESSMENTS
      -------------------------------------------------------- */

      const assessments =
        await Assessment.find({

          doctorId:
            req.user._id,

          patientId: {
            $in: patientIds,
          },

        })

          .populate({

            path:
              "patientId",

            select:
              "fullName age gender email profilePicture",

          })

          .sort({

            createdAt:
              -1,

          })

          .lean();


      /* --------------------------------------------------------
         KEEP ONLY LATEST ASSESSMENT
         PER PATIENT
      -------------------------------------------------------- */

      const latestAssessmentMap =
        new Map();


      assessments.forEach(
        (assessment) => {

          const currentPatientId =
            assessment.patientId?._id
              ?.toString();


          if (
            currentPatientId &&
            !latestAssessmentMap.has(
              currentPatientId
            )
          ) {

            latestAssessmentMap.set(
              currentPatientId,
              assessment
            );

          }

        }
      );


      /* --------------------------------------------------------
         FILTER PATIENTS NEEDING ATTENTION
      -------------------------------------------------------- */

      const attentionAssessments =
        Array.from(
          latestAssessmentMap.values()
        ).filter(
          (assessment) =>
            assessment.prediction ===
              "Mild Dementia" ||

            assessment.prediction ===
              "Moderate Dementia"
        );


      /* --------------------------------------------------------
         RESPONSE
      -------------------------------------------------------- */

      return res.status(200).json({

        success: true,

        count:
          attentionAssessments.length,

        patients:
          attentionAssessments,

      });

    } catch (error) {

      console.error(
        "Get patients needing attention error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load patients needing attention.",

      });

    }

  };


/* ============================================================
   GET ALL AI ASSESSMENTS FOR LOGGED-IN DOCTOR

   Used by:

   Doctor → AI Reports

   Returns:

   - Patient
   - Prediction
   - Confidence
   - Probabilities
   - Assessment date
   - Doctor
   - Caregiver
   - Person who performed assessment
   - Model information

   Only assessments belonging to this doctor
   are returned.
============================================================ */

export const getDoctorAssessments =
  async (
    req,
    res
  ) => {

    try {

      /* --------------------------------------------------------
         VERIFY DOCTOR
      -------------------------------------------------------- */

      if (
        !req.user ||
        req.user.role !== "doctor"
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Only doctors can access AI reports.",

        });

      }


      /* --------------------------------------------------------
         GET DOCTOR ASSESSMENTS
      -------------------------------------------------------- */

      const assessments =
        await Assessment.find({

          doctorId:
            req.user._id,

        })

          /* ----------------------------------------------------
             PATIENT
          ---------------------------------------------------- */

          .populate({

            path:
              "patientId",

            select:
              "fullName age gender email phone profilePicture",

          })

          /* ----------------------------------------------------
             DOCTOR
          ---------------------------------------------------- */

          .populate({

            path:
              "doctorId",

            select:
              "fullName email phone profilePicture doctorDetails",

          })

          /* ----------------------------------------------------
             CAREGIVER
          ---------------------------------------------------- */

          .populate({

            path:
              "caregiverId",

            select:
              "fullName email phone relationship profilePicture",

          })

          /* ----------------------------------------------------
             PERSON WHO PERFORMED ASSESSMENT
          ---------------------------------------------------- */

          .populate({

            path:
              "createdBy",

            select:
              "fullName email role profilePicture",

          })

          /* ----------------------------------------------------
             NEWEST FIRST
          ---------------------------------------------------- */

          .sort({

            createdAt:
              -1,

          })

          .lean();


      /* --------------------------------------------------------
         RESPONSE
      -------------------------------------------------------- */

      return res.status(200).json({

        success: true,

        count:
          assessments.length,

        assessments,

      });

    } catch (error) {

      console.error(
        "Get doctor assessments error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Unable to load AI reports.",

      });

    }

  };