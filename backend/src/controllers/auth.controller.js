import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

/* ============================================================
   JWT TOKEN
============================================================ */

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET
  );
};

/* ============================================================
   CLOUDINARY PROFILE PICTURE
============================================================ */

const uploadProfilePicture = async (file) => {
  if (!file) {
    return {
      url: "",
      publicId: "",
    };
  }

  const uploadResult = await new Promise(
    (resolve, reject) => {
      const stream =
        cloudinary.uploader.upload_stream(
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
        message:
          "All required fields must be provided.",
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

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

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

    const salt = await bcrypt.genSalt(12);

    const hashedPassword =
      await bcrypt.hash(password, salt);

    const profilePicture =
      await uploadProfilePicture(req.file);

    const user = await User.create({
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: "patient",
      emergencyContact:
        emergencyContact.trim(),
      relationship,
      address: address.trim(),
      profilePicture,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message:
        "Patient account created successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture:
          user.profilePicture,
      },
    });
  } catch (error) {
    console.error(
      "Patient registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create patient account.",
    });
  }
};

/* ============================================================
   CAREGIVER REGISTRATION
============================================================ */

export const registerCaregiver = async (
  req,
  res
) => {
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
        message:
          "All required fields must be provided.",
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

    const normalizedEmail =
      email.trim().toLowerCase();

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

    const salt = await bcrypt.genSalt(12);

    const hashedPassword =
      await bcrypt.hash(password, salt);

    const profilePicture =
      await uploadProfilePicture(req.file);

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

    const token = generateToken(user);

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
        profilePicture:
          user.profilePicture,
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

/* ============================================================
   DOCTOR REGISTRATION
============================================================ */

export const registerDoctor = async (
  req,
  res
) => {
  try {
    const {
      fullName,
      email,
      phone,
      specialization,
      registrationNumber,
      hospital,
      password,
      confirmPassword,
      address,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (
      !fullName ||
      !email ||
      !phone ||
      !specialization ||
      !registrationNumber ||
      !hospital ||
      !password ||
      !confirmPassword ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields must be provided.",
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

    /* ---------------- NORMALIZE ---------------- */

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedRegistrationNumber =
      registrationNumber.trim().toUpperCase();

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

    /* ---------------- CHECK REGISTRATION NUMBER ---------------- */

    const existingRegistrationNumber =
      await User.findOne({
        "doctorDetails.registrationNumber":
          normalizedRegistrationNumber,
      });

    if (existingRegistrationNumber) {
      return res.status(409).json({
        success: false,
        message:
          "A doctor account with this registration number already exists.",
      });
    }

    /* ---------------- PASSWORD HASH ---------------- */

    const salt = await bcrypt.genSalt(12);

    const hashedPassword =
      await bcrypt.hash(password, salt);

    /* ---------------- PROFILE PICTURE ---------------- */

    const profilePicture =
      await uploadProfilePicture(req.file);

    /* ---------------- CREATE DOCTOR ---------------- */

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: "doctor",
      address: address.trim(),

      doctorDetails: {
        specialization:
          specialization.trim(),
        registrationNumber:
          normalizedRegistrationNumber,
        hospital: hospital.trim(),
      },

      profilePicture,
    });

    /* ---------------- JWT ---------------- */

    const token = generateToken(user);

    /* ---------------- RESPONSE ---------------- */

    return res.status(201).json({
      success: true,
      message:
        "Doctor account created successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        doctorDetails:
          user.doctorDetails,
        profilePicture:
          user.profilePicture,
      },
    });
  } catch (error) {
    console.error(
      "Doctor registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create doctor account.",
    });
  }
};

/* ============================================================
   LOGIN
============================================================ */

export const login = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    /* ---------------- NORMALIZE EMAIL ---------------- */

    const normalizedEmail =
      email.trim().toLowerCase();

    /* ---------------- FIND USER ---------------- */

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /* ---------------- ROLE CHECK ---------------- */

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message:
          `This account is not registered as a ${role}.`,
      });
    }

    /* ---------------- PASSWORD CHECK ---------------- */

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /* ---------------- JWT ---------------- */

    const token = generateToken(user);

    /* ---------------- RESPONSE ---------------- */

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        doctorDetails:
          user.doctorDetails,
        profilePicture:
          user.profilePicture,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to login. Please try again.",
    });
  }
};