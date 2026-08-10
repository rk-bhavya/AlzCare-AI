import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
  );
};

const uploadProfilePicture = async (file) => {
  if (!file) {
    return {
      url: "",
      publicId: "",
    };
  }

  const uploadResult = await new Promise(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "alzcare/users",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(file.buffer);
    }
  );

  return {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
  };
};

/* ============================================================
   PATIENT REGISTRATION
============================================================ */

export const registerPatient = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      email,
      phone,
      password,
      confirmPassword,
      emergencyContact,
      relationship,
      address,
    } = req.body;

    if (
      !fullName ||
      !age ||
      !gender ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !emergencyContact ||
      !relationship ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const existingPhone = await User.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "An account with this phone number already exists.",
      });
    }

    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const profilePicture = await uploadProfilePicture(
      req.file
    );

    const user = await User.create({
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: "patient",
      emergencyContact: emergencyContact.trim(),
      relationship,
      address: address.trim(),
      profilePicture,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Patient account created successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error(
      "Patient registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create patient account.",
    });
  }
};

/* ============================================================
   CAREGIVER REGISTRATION
============================================================ */

export const registerCaregiver = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      relationship,
      address,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !relationship ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    /* ---------------- CHECK EMAIL ---------------- */

    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    /* ---------------- CHECK PHONE ---------------- */

    const existingPhone = await User.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this phone number already exists.",
      });
    }

    /* ---------------- PASSWORD HASHING ---------------- */

    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    /* ---------------- PROFILE PICTURE ---------------- */

    const profilePicture =
      await uploadProfilePicture(req.file);

    /* ---------------- CREATE CAREGIVER ---------------- */

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: "caregiver",
      relationship,
      address: address.trim(),
      profilePicture,
    });

    /* ---------------- JWT ---------------- */

    const token = generateToken(user);

    /* ---------------- RESPONSE ---------------- */

    return res.status(201).json({
      success: true,
      message:
        "Caregiver account created successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error(
      "Caregiver registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create caregiver account.",
    });
  }
};