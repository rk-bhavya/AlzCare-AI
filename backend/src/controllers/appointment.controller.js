import mongoose from "mongoose";

import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/* ============================================================
   CREATE APPOINTMENT
   Doctor creates an appointment for a patient
============================================================ */

export const createAppointment = async (
  req,
  res
) => {
  try {

    const {
      patientId,
      appointmentDate,
      type,
      notes,
    } = req.body;


    /* --------------------------------------------------------
       VALIDATION
    -------------------------------------------------------- */

    if (
      !patientId ||
      !appointmentDate ||
      !type
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient, appointment date, and appointment type are required.",
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
      }).select(
        "fullName age gender email"
      );


    if (!patient) {
      return res.status(404).json({
        success: false,
        message:
          "Patient not found.",
      });
    }


    /* --------------------------------------------------------
       VALIDATE DATE
    -------------------------------------------------------- */

    const parsedDate =
      new Date(appointmentDate);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment date.",
      });
    }


    /* --------------------------------------------------------
       PREVENT APPOINTMENT IN THE PAST
    -------------------------------------------------------- */

    if (
      parsedDate.getTime() <
      Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment date cannot be in the past.",
      });
    }


    /* --------------------------------------------------------
       CREATE APPOINTMENT
    -------------------------------------------------------- */

    const appointment =
      await Appointment.create({
        patientId,
        doctorId: req.user._id,
        appointmentDate: parsedDate,
        type: type.trim(),
        notes: notes?.trim() || "",
        status: "scheduled",
      });

      /* ============================================================
   CREATE APPOINTMENT NOTIFICATION
============================================================ */

try {

  await Notification.create({
    recipientId: req.user._id,

    patientId,

    title: "New Appointment Scheduled",

    message:
      `An appointment has been scheduled for ${patient.fullName}.`,

    type: "info",

    referenceId:
      appointment._id,

    referenceType: "appointment",

    isRead: false,
  });

} catch (notificationError) {

  console.error(
    "Unable to create appointment notification:",
    notificationError
  );

}
    /* --------------------------------------------------------
       RETURN POPULATED APPOINTMENT
    -------------------------------------------------------- */

    const populatedAppointment =
      await Appointment.findById(
        appointment._id
      )
        .populate({
          path: "patientId",
          select:
            "fullName age gender email profilePicture",
        })
        .populate({
          path: "doctorId",
          select:
            "fullName email doctorDetails profilePicture",
        });


    return res.status(201).json({
      success: true,
      message:
        "Appointment created successfully.",
      appointment:
        populatedAppointment,
    });

  } catch (error) {

    console.error(
      "Create appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create appointment.",
    });
  }
};


/* ============================================================
   GET DOCTOR'S UPCOMING APPOINTMENTS

   Returns scheduled appointments from now onward.
============================================================ */

export const getDoctorAppointments =
  async (req, res) => {

    try {

      const appointments =
        await Appointment.find({
          doctorId: req.user._id,
          status: "scheduled",
          appointmentDate: {
            $gte: new Date(),
          },
        })
          .populate({
            path: "patientId",
            select:
              "fullName age gender profilePicture",
          })
          .sort({
            appointmentDate: 1,
          })
          .lean();


      return res.status(200).json({
        success: true,
        appointments,
      });

    } catch (error) {

      console.error(
        "Get doctor appointments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load appointments.",
      });
    }
  };


/* ============================================================
   GET TODAY'S APPOINTMENTS

   Used by the Doctor Dashboard.
============================================================ */

export const getTodaysAppointments =
  async (req, res) => {

    try {

      const now = new Date();


      /* --------------------------------------------------------
         START OF TODAY
      -------------------------------------------------------- */

      const startOfDay =
        new Date(now);

      startOfDay.setHours(
        0,
        0,
        0,
        0
      );


      /* --------------------------------------------------------
         END OF TODAY
      -------------------------------------------------------- */

      const endOfDay =
        new Date(now);

      endOfDay.setHours(
        23,
        59,
        59,
        999
      );


      const appointments =
        await Appointment.find({
          doctorId: req.user._id,

          appointmentDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },

          status: {
            $in: [
              "scheduled",
              "rescheduled",
            ],
          },
        })
          .populate({
            path: "patientId",
            select:
              "fullName age gender profilePicture",
          })
          .sort({
            appointmentDate: 1,
          })
          .lean();


      return res.status(200).json({
        success: true,
        appointments,
        count:
          appointments.length,
      });

    } catch (error) {

      console.error(
        "Get today's appointments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load today's appointments.",
      });
    }
  };


/* ============================================================
   UPDATE APPOINTMENT STATUS
============================================================ */

export const updateAppointmentStatus =
  async (req, res) => {

    try {

      const {
        appointmentId,
      } = req.params;

      const {
        status,
      } = req.body;


      /* --------------------------------------------------------
         VALIDATION
      -------------------------------------------------------- */

      if (
        !mongoose.isValidObjectId(
          appointmentId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid appointment ID.",
        });
      }


      const allowedStatuses = [
        "scheduled",
        "completed",
        "cancelled",
        "rescheduled",
      ];


      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid appointment status.",
        });
      }


      /* --------------------------------------------------------
         FIND DOCTOR'S APPOINTMENT
      -------------------------------------------------------- */

      const appointment =
        await Appointment.findOne({
          _id: appointmentId,
          doctorId: req.user._id,
        });


      if (!appointment) {
        return res.status(404).json({
          success: false,
          message:
            "Appointment not found.",
        });
      }


      /* --------------------------------------------------------
         UPDATE STATUS
      -------------------------------------------------------- */

      appointment.status =
        status;

      await appointment.save();


      /* --------------------------------------------------------
         RETURN UPDATED APPOINTMENT
      -------------------------------------------------------- */

      const updatedAppointment =
        await Appointment.findById(
          appointment._id
        )
          .populate({
            path: "patientId",
            select:
              "fullName age gender profilePicture",
          })
          .lean();


      return res.status(200).json({
        success: true,
        message:
          "Appointment status updated successfully.",
        appointment:
          updatedAppointment,
      });

    } catch (error) {

      console.error(
        "Update appointment status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update appointment.",
      });
    }
  };