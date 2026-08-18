import mongoose from "mongoose";

import Message from "../models/Message.js";
import User from "../models/User.js";
import CareAssignment from "../models/CareAssignment.js";


/* ============================================================
   GET DOCTOR'S CAREGIVERS
============================================================ */

export const getDoctorCaregivers =
  async (req, res) => {

    try {

      const caregivers =
        await User.find({
          role: "caregiver",
        })
          .select(
            "fullName email phone profilePicture"
          )
          .sort({
            fullName: 1,
          })
          .lean();

      const contacts =
        await Promise.all(
          caregivers.map(
            async (caregiver) => {

              const lastMessage =
                await Message.findOne({
                  $or: [
                    {
                      senderId:
                        req.user._id,

                      receiverId:
                        caregiver._id,
                    },
                    {
                      senderId:
                        caregiver._id,

                      receiverId:
                        req.user._id,
                    },
                  ],
                })
                  .sort({
                    createdAt: -1,
                  })
                  .lean();

              const unread =
                await Message.countDocuments({
                  senderId:
                    caregiver._id,

                  receiverId:
                    req.user._id,

                  isRead: false,
                });

              return {
                _id:
                  caregiver._id,

                fullName:
                  caregiver.fullName,

                email:
                  caregiver.email,

                phone:
                  caregiver.phone,

                profilePicture:
                  caregiver.profilePicture,

                lastMessage:
                  lastMessage?.text || "",

                lastMessageAt:
                  lastMessage?.createdAt ||
                  null,

                unread,
              };
            }
          )
        );


      return res.status(200).json({
        success: true,
        caregivers: contacts,
      });

    } catch (error) {

      console.error(
        "Get doctor caregivers error:",
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
   GET CONVERSATION
============================================================ */

export const getConversation =
  async (req, res) => {

    try {

      const {
        caregiverId,
      } = req.params;


      if (
        !mongoose.isValidObjectId(
          caregiverId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid caregiver ID.",
        });
      }


      const caregiver =
        await User.findOne({
          _id: caregiverId,
          role: "caregiver",
        })
          .select(
            "fullName email phone profilePicture"
          )
          .lean();


      if (!caregiver) {
        return res.status(404).json({
          success: false,
          message:
            "Caregiver not found.",
        });
      }


      const messages =
        await Message.find({
          $or: [
            {
              senderId:
                req.user._id,

              receiverId:
                caregiverId,
            },
            {
              senderId:
                caregiverId,

              receiverId:
                req.user._id,
            },
          ],
        })
          .populate({
            path: "senderId",
            select:
              "fullName role profilePicture",
          })
          .populate({
            path: "receiverId",
            select:
              "fullName role profilePicture",
          })
          .populate({
            path: "patientId",
            select:
              "fullName age gender",
          })
          .sort({
            createdAt: 1,
          })
          .lean();


      /* --------------------------------------------------------
         MARK RECEIVED MESSAGES AS READ
      -------------------------------------------------------- */

      await Message.updateMany(
        {
          senderId:
            caregiverId,

          receiverId:
            req.user._id,

          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );


      return res.status(200).json({
        success: true,
        caregiver,
        messages,
      });

    } catch (error) {

      console.error(
        "Get conversation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load conversation.",
      });
    }
  };


/* ============================================================
   SEND MESSAGE
============================================================ */

export const sendMessage =
  async (req, res) => {

    try {

      const {
        receiverId,
        patientId,
        text,
      } = req.body;


      if (
        !receiverId ||
        !text?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Receiver and message text are required.",
        });
      }


      if (
        !mongoose.isValidObjectId(
          receiverId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid receiver ID.",
        });
      }


      /*
       * The expected receiver role depends on who is sending:
       * - a doctor may only message a caregiver (existing behavior)
       * - a caregiver may only message a doctor
       */

      const expectedReceiverRole =
        req.user.role === "caregiver"
          ? "doctor"
          : "caregiver";


      const receiver =
        await User.findOne({
          _id: receiverId,
          role: expectedReceiverRole,
        });


      if (!receiver) {
        return res.status(404).json({
          success: false,
          message:
            expectedReceiverRole === "doctor"
              ? "Doctor not found."
              : "Caregiver not found.",
        });
      }


      /*
       * If a caregiver is sending, verify the receiving doctor
       * is actually their assigned doctor through an ACTIVE
       * CareAssignment. Never trust the frontend for this.
       */

      if (req.user.role === "caregiver") {

        const assignment =
          await CareAssignment.findOne({
            caregiverId: req.user._id,
            doctorId: receiverId,
            status: "active",
          });

        if (!assignment) {
          return res.status(403).json({
            success: false,
            message:
              "You can only message a doctor assigned to your patient.",
          });
        }
      }


      let validPatientId = null;


      if (patientId) {

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

        validPatientId =
          patient._id;
      }


      const message =
        await Message.create({
          senderId:
            req.user._id,

          receiverId:
            receiverId,

          patientId:
            validPatientId,

          text:
            text.trim(),

          isRead:
            false,
        });


      const populatedMessage =
        await Message.findById(
          message._id
        )
          .populate({
            path: "senderId",
            select:
              "fullName role profilePicture",
          })
          .populate({
            path: "receiverId",
            select:
              "fullName role profilePicture",
          })
          .populate({
            path: "patientId",
            select:
              "fullName age gender",
          })
          .lean();


      return res.status(201).json({
        success: true,
        message:
          "Message sent successfully.",
        data:
          populatedMessage,
      });

    } catch (error) {

      console.error(
        "Send message error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send message.",
      });
    }
  };

/* ============================================================
   GET CAREGIVER'S DOCTOR(S)

   Unlike getDoctorCaregivers (which lists every caregiver in
   the system for a doctor to browse), a caregiver may only see
   the doctor(s) actually assigned to their patient(s) — never
   an arbitrary list of unrelated users.
============================================================ */

export const getCaregiverDoctors = async (req, res) => {
  try {
    const assignments = await CareAssignment.find({
      caregiverId: req.user._id,
      status: "active",
    })
      .populate({
        path: "doctorId",
        select: "fullName email phone doctorDetails profilePicture",
      })
      .lean();

    const uniqueDoctors = new Map();

    assignments.forEach((assignment) => {
      if (assignment.doctorId) {
        uniqueDoctors.set(
          String(assignment.doctorId._id),
          assignment.doctorId
        );
      }
    });

    const contacts = await Promise.all(
      Array.from(uniqueDoctors.values()).map(async (doctor) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: req.user._id, receiverId: doctor._id },
            { senderId: doctor._id, receiverId: req.user._id },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();

        const unread = await Message.countDocuments({
          senderId: doctor._id,
          receiverId: req.user._id,
          isRead: false,
        });

        return {
          _id: doctor._id,
          fullName: doctor.fullName,
          email: doctor.email,
          phone: doctor.phone,
          doctorDetails: doctor.doctorDetails,
          profilePicture: doctor.profilePicture,
          lastMessage: lastMessage?.text || "",
          lastMessageAt: lastMessage?.createdAt || null,
          unread,
        };
      })
    );

    return res.status(200).json({
      success: true,
      doctors: contacts,
    });
  } catch (error) {
    console.error("Get caregiver doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load doctors.",
    });
  }
};

/* ============================================================
   GET CAREGIVER <-> DOCTOR CONVERSATION

   GET /messages/conversation/doctor/:doctorId

   Ownership verified: the doctor must be assigned to one of
   the caregiver's ACTIVE patients.
============================================================ */

export const getCaregiverConversation = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const assignment = await CareAssignment.findOne({
      caregiverId: req.user._id,
      doctorId,
      status: "active",
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This doctor is not assigned to your patient.",
      });
    }

    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
    })
      .select("fullName email phone doctorDetails profilePicture")
      .lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: doctorId },
        { senderId: doctorId, receiverId: req.user._id },
      ],
    })
      .populate({ path: "senderId", select: "fullName role profilePicture" })
      .populate({
        path: "receiverId",
        select: "fullName role profilePicture",
      })
      .populate({ path: "patientId", select: "fullName age gender" })
      .sort({ createdAt: 1 })
      .lean();

    await Message.updateMany(
      {
        senderId: doctorId,
        receiverId: req.user._id,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      doctor,
      messages,
    });
  } catch (error) {
    console.error("Get caregiver conversation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load conversation.",
    });
  }
};
