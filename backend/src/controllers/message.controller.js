import mongoose from "mongoose";

import Message from "../models/Message.js";
import User from "../models/User.js";


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


      const receiver =
        await User.findOne({
          _id: receiverId,
          role: "caregiver",
        });


      if (!receiver) {
        return res.status(404).json({
          success: false,
          message:
            "Caregiver not found.",
        });
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