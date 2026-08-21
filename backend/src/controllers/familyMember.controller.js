import mongoose from "mongoose";

import FamilyMember from "../models/FamilyMember.js";
import cloudinary from "../config/cloudinary.js";
import { verifyCaregiverOwnsPatient } from "./caregiver.controller.js";
import { generateFaceEmbedding, FaceRecognitionServiceError } from "../services/faceRecognition.service.js";

/* ============================================================
   PHOTO UPLOAD HELPER

   Reuses the same Cloudinary upload pattern already used for
   user profile pictures (see auth.controller.js). No new
   upload architecture is introduced.

   NOTE: This photo is stored purely as reference data for a
   future face-recognition feature. No recognition/matching
   logic exists yet.
============================================================ */

const uploadFamilyMemberPhoto = async (file) => {
  if (!file) {
    return { url: "", publicId: "" };
  }

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "alzcare/family-members",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(file.buffer);
  });

  return {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  };
};

/* ============================================================
   GET FAMILY MEMBERS FOR A PATIENT

   GET /family-members/patient/:patientId
============================================================ */

export const getFamilyMembersForPatient = async (req, res) => {
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

    const familyMembers = await FamilyMember.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      familyMembers,
    });
  } catch (error) {
    console.error("Get family members error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load family members.",
    });
  }
};

/* ============================================================
   CREATE FAMILY MEMBER

   POST /family-members
   multipart/form-data: patientId, name, relationship, photo?
============================================================ */

export const createFamilyMember = async (req, res) => {
  try {
    const { patientId, name, relationship } = req.body;

    if (!patientId || !name || !relationship) {
      return res.status(400).json({
        success: false,
        message: "Patient, name, and relationship are required.",
      });
    }

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

    // Generate the template before uploading/saving so invalid photos never
    // create an apparently valid face profile.
    const faceProfile = req.file ? await generateFaceEmbedding(req.file) : null;
    const photo = await uploadFamilyMemberPhoto(req.file);

    const familyMember = await FamilyMember.create({
      patientId,
      addedBy: req.user._id,
      name: name.trim(),
      relationship: relationship.trim(),
      photo,
      ...(faceProfile && { faceEmbedding: faceProfile.embedding, faceEmbeddingModel: faceProfile.model, faceProfileRegistered: true }),
    });

    return res.status(201).json({
      success: true,
      message: "Family member added successfully.",
      familyMember,
    });
  } catch (error) {
    if (error instanceof FaceRecognitionServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Create family member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add family member.",
    });
  }
};

/* ============================================================
   DELETE FAMILY MEMBER

   DELETE /family-members/:familyMemberId

   Ownership is verified by resolving the family member's
   patientId back to an ACTIVE CareAssignment for this caregiver
   — a family member ID can never be trusted on its own.
============================================================ */

export const deleteFamilyMember = async (req, res) => {
  try {
    const { familyMemberId } = req.params;

    if (!mongoose.isValidObjectId(familyMemberId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid family member ID.",
      });
    }

    const familyMember = await FamilyMember.findById(familyMemberId);

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found.",
      });
    }

    const assignment = await verifyCaregiverOwnsPatient(
      req.user._id,
      familyMember.patientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to your care.",
      });
    }

    if (familyMember.photo?.publicId) {
      try {
        await cloudinary.uploader.destroy(familyMember.photo.publicId);
      } catch (cloudinaryError) {
        console.error(
          "Unable to remove family member photo from Cloudinary:",
          cloudinaryError
        );
      }
    }

    await familyMember.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Family member removed successfully.",
    });
  } catch (error) {
    console.error("Delete family member error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove family member.",
    });
  }
};
