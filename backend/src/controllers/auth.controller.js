import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";
import cloudinary from "../config/cloudinary.js";
import transporter from "../config/mailer.js";

import {
  generateOTP,
  hashOTP,
} from "../utils/otp.js";

import sendSMSOTP from "../utils/sms.js";

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

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedRegistrationNumber =
      registrationNumber.trim().toUpperCase();

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

    const token = generateToken(user);

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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

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

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message:
          `This account is not registered as a ${role}.`,
      });
    }

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

    const token = generateToken(user);

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

/* ============================================================
   FORGOT PASSWORD - SEND OTP
============================================================ */

export const forgotPassword = async (req, res) => {
  try {
    const {
      email,
      phone,
      method = "email",
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (!["email", "phone"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification method.",
      });
    }

    if (method === "email" && !email) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is required.",
      });
    }

    if (method === "phone" && !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number is required.",
      });
    }

    /* ---------------- FIND USER ---------------- */

    let user;

    if (method === "email") {
      const normalizedEmail =
        email.trim().toLowerCase();

      user = await User.findOne({
        email: normalizedEmail,
      });
    } else {
      const normalizedPhone =
        phone
          .replace(/\D/g, "")
          .replace(/^91/, "");

      user = await User.findOne({
        phone: normalizedPhone,
      });
    }

    /*
     * Do not reveal whether an account exists.
     */

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this information, an OTP has been sent.",
      });
    }

    /* ---------------- DELETE OLD OTP ---------------- */

    await PasswordReset.deleteMany({
      userId: user._id,
    });

    /* ---------------- GENERATE OTP ---------------- */

    const otp = generateOTP();

    const otpHash = hashOTP(otp);

    /* ---------------- EXPIRATION ---------------- */

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    /* ---------------- NORMALIZE PHONE ---------------- */

    const normalizedPhone = user.phone
      ? user.phone
          .replace(/\D/g, "")
          .replace(/^91/, "")
      : "";

    /* ---------------- SAVE RESET REQUEST ---------------- */

    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      phone: normalizedPhone,
      method,
      otpHash,
      expiresAt,
    });

    /* ========================================================
       EMAIL OTP
    ======================================================== */

    if (method === "email") {
      await transporter.sendMail({
        from: `"AlzCare AI" <${process.env.EMAIL_USER}>`,
        to: user.email,

        subject:
          "AlzCare AI - Password Reset OTP",

        text: `
Hello ${user.fullName},

Your AlzCare AI password reset OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request a password reset,
please ignore this email.

Regards,
AlzCare AI Team
        `,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background: #f5f7fb;
          ">

            <div style="
              background: #ffffff;
              padding: 30px;
              border-radius: 14px;
            ">

              <h2 style="color:#4f46e5;">
                AlzCare AI
              </h2>

              <p>
                Hello ${user.fullName},
              </p>

              <p>
                Your password reset verification code is:
              </p>

              <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #4f46e5;
                margin: 20px 0;
              ">
                ${otp}
              </div>

              <p>
                This OTP is valid for
                <strong>10 minutes</strong>.
              </p>

              <p style="color:#777;">
                If you did not request a password reset,
                please ignore this email.
              </p>

              <hr />

              <p style="
                font-size:12px;
                color:#999;
              ">
                AlzCare AI — Intelligent Alzheimer's Care
              </p>

            </div>

          </div>
        `,
      });
    }

    /* ========================================================
       SMS OTP
    ======================================================== */

    if (method === "phone") {
      await sendSMSOTP(
        normalizedPhone,
        otp
      );
    }

    return res.status(200).json({
      success: true,
      message:
        method === "email"
          ? "OTP sent to your registered email."
          : "OTP sent to your registered phone number.",
    });

  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request.",
    });
  }
};

/* ============================================================
   VERIFY OTP
============================================================ */

export const verifyOTP = async (req, res) => {
  try {
    const {
      email,
      phone,
      otp,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required.",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must contain exactly 6 digits.",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Email or phone number is required.",
      });
    }

    /* ---------------- FIND RESET REQUEST ---------------- */

    let resetRequest;

    if (email) {
      const normalizedEmail =
        email.trim().toLowerCase();

      resetRequest =
        await PasswordReset.findOne({
          email: normalizedEmail,
          method: "email",
        });
    } else {
      const normalizedPhone =
        phone
          .replace(/\D/g, "")
          .replace(/^91/, "");

      resetRequest =
        await PasswordReset.findOne({
          phone: normalizedPhone,
          method: "phone",
        });
    }

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message:
          "OTP is invalid or has expired. Please request a new OTP.",
      });
    }

    /* ---------------- CHECK EXPIRATION ---------------- */

    if (
      resetRequest.expiresAt < new Date()
    ) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new one.",
      });
    }

    /* ---------------- CHECK ATTEMPTS ---------------- */

    if (resetRequest.attempts >= 5) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    /* ---------------- VERIFY OTP ---------------- */

    const enteredOTPHash =
      hashOTP(otp);

    if (
      enteredOTPHash !==
      resetRequest.otpHash
    ) {
      resetRequest.attempts += 1;

      await resetRequest.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP.",
      });
    }

    /* ---------------- SUCCESS ---------------- */

    return res.status(200).json({
      success: true,
      message:
        "OTP verified successfully.",
    });

  } catch (error) {
    console.error(
      "OTP verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify OTP. Please try again.",
    });
  }
};

/* ============================================================
   RESET PASSWORD
============================================================ */

export const resetPassword = async (req, res) => {
  try {
    const {
      email,
      phone,
      otp,
      newPassword,
      confirmPassword,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (
      (!email && !phone) ||
      !otp ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required fields must be provided.",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message:
          "OTP must contain exactly 6 digits.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters.",
      });
    }

    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Passwords do not match.",
      });
    }

    /* ---------------- FIND RESET REQUEST ---------------- */

    let resetRequest;

    if (email) {
      const normalizedEmail =
        email.trim().toLowerCase();

      resetRequest =
        await PasswordReset.findOne({
          email: normalizedEmail,
          method: "email",
        });
    } else {
      const normalizedPhone =
        phone
          .replace(/\D/g, "")
          .replace(/^91/, "");

      resetRequest =
        await PasswordReset.findOne({
          phone: normalizedPhone,
          method: "phone",
        });
    }

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message:
          "Password reset request is invalid or expired.",
      });
    }

    /* ---------------- CHECK EXPIRATION ---------------- */

    if (
      resetRequest.expiresAt < new Date()
    ) {
      await PasswordReset.deleteOne({
        _id: resetRequest._id,
      });

      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new one.",
      });
    }

    /* ---------------- VERIFY OTP AGAIN ---------------- */

    const enteredOTPHash =
      hashOTP(otp);

    if (
      enteredOTPHash !==
      resetRequest.otpHash
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    /* ---------------- FIND USER ---------------- */

    const user = await User.findById(
      resetRequest.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found.",
      });
    }

    /* ---------------- HASH NEW PASSWORD ---------------- */

    const salt =
      await bcrypt.genSalt(12);

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        salt
      );

    /* ---------------- UPDATE PASSWORD ---------------- */

    user.password = hashedPassword;

    await user.save();

    /* ---------------- DELETE USED OTP ---------------- */

    await PasswordReset.deleteOne({
      _id: resetRequest._id,
    });

    /* ---------------- RESPONSE ---------------- */

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });

  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password. Please try again.",
    });
  }
};