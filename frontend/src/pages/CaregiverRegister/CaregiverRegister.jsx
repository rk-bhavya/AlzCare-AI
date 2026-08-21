import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCamera,
  FaUser,
  FaHeart,
} from "react-icons/fa";

import { ROUTES } from "../../config/constants.js";
import { registerCaregiver } from "../../api/auth.api.js";
import brain from "../../assets/images/brain.png";

import "./CaregiverRegister.css";

const CaregiverRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    relationship: "",
    address: "",
  });

  const [profilePicture, setProfilePicture] =
    useState(null);

  const [preview, setPreview] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [serverError, setServerError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
    setSuccessMessage("");
  };

  const handleProfilePicture = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        profilePicture:
          "Please select a valid image.",
      }));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        profilePicture:
          "Profile picture must be less than 5 MB.",
      }));

      return;
    }

    setProfilePicture(file);

    setPreview(URL.createObjectURL(file));

    setErrors((previous) => ({
      ...previous,
      profilePicture: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required.";
    } else if (
      formData.fullName.trim().length < 2
    ) {
      newErrors.fullName =
        "Full name must contain at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Please enter a valid email.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
    } else if (
      !/^[6-9]\d{9}$/.test(formData.phone)
    ) {
      newErrors.phone =
        "Enter a valid 10-digit phone number.";
    }

    if (!formData.password) {
      newErrors.password =
        "Password is required.";
    } else if (
      formData.password.length < 8
    ) {
      newErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      formData.password !==
      formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (!formData.relationship) {
      newErrors.relationship =
        "Please select your relationship to the patient.";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Address is required.";
    } else if (
      formData.address.trim().length < 5
    ) {
      newErrors.address =
        "Please enter a valid address.";
    }

    if (
      profilePicture &&
      profilePicture.size > 5 * 1024 * 1024
    ) {
      newErrors.profilePicture =
        "Profile picture must be less than 5 MB.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");
    setSuccessMessage("");

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      const data = new FormData();

      data.append(
        "fullName",
        formData.fullName.trim()
      );

      data.append(
        "email",
        formData.email.trim()
      );

      data.append(
        "phone",
        formData.phone.trim()
      );

      data.append(
        "password",
        formData.password
      );

      data.append(
        "confirmPassword",
        formData.confirmPassword
      );

      data.append(
        "relationship",
        formData.relationship
      );

      data.append(
        "address",
        formData.address.trim()
      );

      if (profilePicture) {
        data.append(
          "profilePicture",
          profilePicture
        );
      }

      const response =
        await registerCaregiver(data);

      if (response.success) {
        if (response.token) {
          localStorage.setItem(
            "nc_access_token",
            response.token
          );
        }

        if (response.user) {
          localStorage.setItem(
            "nc_user",
            JSON.stringify(response.user)
          );
        }

        setSuccessMessage(
          "Caregiver account created successfully!"
        );

        setTimeout(() => {
          navigate(
            ROUTES.CAREGIVER_DASHBOARD
          );
        }, 1200);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to create your account. Please try again.";

      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="caregiver-register-page">

      {/* ================= LEFT PANEL ================= */}

      <section className="caregiver-register-info">

        <button
          type="button"
          className="caregiver-back-button"
          onClick={() =>
            navigate(ROUTES.REGISTER)
          }
        >
          <FaArrowLeft />
          Back
        </button>

        <span className="caregiver-register-tag">
          AI • HEALTHCARE • CAREGIVER
        </span>

        <div className="caregiver-brain-wrapper">
          <img
            src={brain}
            alt="AI Brain"
            className="caregiver-brain"
          />
        </div>

        <h1>
          Welcome to{" "}
          <span>AlzCare AI</span>
        </h1>

        <h2>
          Supporting care with
          <br />
          intelligence and compassion.
        </h2>

        <p>
          Create your caregiver account to
          monitor your patient's wellbeing,
          manage daily assistance and stay
          connected with important health updates.
        </p>

        <div className="caregiver-register-points">
          <span>
            <FaHeart />
            Patient Support
          </span>

          <span>
            ✓ Smart Reminders
          </span>

          <span>
            ✓ Risk Alerts
          </span>
        </div>

      </section>

      {/* ================= RIGHT PANEL ================= */}

      <section className="caregiver-register-form-section">

        <div className="caregiver-register-form-wrapper">

          <div className="caregiver-form-header">

            <span className="caregiver-form-step">
              STEP 2 OF 2
            </span>

            <h2>
              Create Caregiver Account
            </h2>

            <p>
              Enter your details to create your
              secure AlzCare AI caregiver account.
            </p>

          </div>

          {serverError && (
            <div className="caregiver-form-alert caregiver-form-alert-error">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="caregiver-form-alert caregiver-form-alert-success">
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* ================= PROFILE ================= */}

            <div className="caregiver-profile-section">

              <div className="caregiver-profile-wrapper">

                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="caregiver-profile-preview"
                  />
                ) : (
                  <div className="caregiver-profile-placeholder">
                    <FaUser />
                  </div>
                )}

                <label
                  htmlFor="caregiverProfilePicture"
                  className="caregiver-camera-button"
                >
                  <FaCamera />
                </label>

                <input
                  id="caregiverProfilePicture"
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleProfilePicture
                  }
                  hidden
                />

              </div>

              <div>
                <h4>
                  Profile Picture
                </h4>

                <p>
                  Optional · JPG, PNG or WEBP ·
                  Max 5 MB
                </p>

                {errors.profilePicture && (
                  <span className="caregiver-field-error">
                    {errors.profilePicture}
                  </span>
                )}
              </div>

            </div>

            {/* ================= PERSONAL ================= */}

            <div className="caregiver-section-title">
              Personal Information
            </div>

            <div className="caregiver-form-grid">

              <div className="caregiver-form-group full-width">

                <label htmlFor="fullName">
                  Full Name
                  <span>*</span>
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />

                {errors.fullName && (
                  <span className="caregiver-field-error">
                    {errors.fullName}
                  </span>
                )}

              </div>

              {/* ================= CONTACT ================= */}

              <div className="caregiver-section-title caregiver-grid-title">
                Contact Information
              </div>

              <div className="caregiver-form-group">

                <label htmlFor="email">
                  Email Address
                  <span>*</span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />

                {errors.email && (
                  <span className="caregiver-field-error">
                    {errors.email}
                  </span>
                )}

              </div>

              <div className="caregiver-form-group">

                <label htmlFor="phone">
                  Phone Number
                  <span>*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength="10"
                  placeholder="10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />

                {errors.phone && (
                  <span className="caregiver-field-error">
                    {errors.phone}
                  </span>
                )}

              </div>

              {/* ================= PATIENT RELATIONSHIP ================= */}

              <div className="caregiver-section-title caregiver-grid-title">
                Patient Relationship
              </div>

              <div className="caregiver-form-group">

                <label htmlFor="relationship">
                  Relationship to Patient
                  <span>*</span>
                </label>

                <select
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                >
                  <option value="">
                    Select relationship
                  </option>

                  <option value="parent">
                    Parent
                  </option>

                  <option value="spouse">
                    Spouse
                  </option>

                  <option value="child">
                    Child
                  </option>

                  <option value="sibling">
                    Sibling
                  </option>

                  <option value="relative">
                    Relative
                  </option>

                  <option value="friend">
                    Friend
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>

                {errors.relationship && (
                  <span className="caregiver-field-error">
                    {errors.relationship}
                  </span>
                )}

              </div>

              <div className="caregiver-relationship-note">
                <span>♥</span>
                You will be able to manage patient
                information from your caregiver portal.
              </div>

              {/* ================= ADDRESS ================= */}

              <div className="caregiver-form-group full-width">

                <label htmlFor="address">
                  Address
                  <span>*</span>
                </label>

                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  placeholder="Enter your residential address"
                  value={formData.address}
                  onChange={handleChange}
                />

                {errors.address && (
                  <span className="caregiver-field-error">
                    {errors.address}
                  </span>
                )}

              </div>

              {/* ================= SECURITY ================= */}

              <div className="caregiver-section-title caregiver-grid-title">
                Account Security
              </div>

              <div className="caregiver-form-group">

                <label htmlFor="password">
                  Password
                  <span>*</span>
                </label>

                <div className="caregiver-password-input">

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <span className="caregiver-field-error">
                    {errors.password}
                  </span>
                )}

              </div>

              <div className="caregiver-form-group">

                <label htmlFor="confirmPassword">
                  Confirm Password
                  <span>*</span>
                </label>

                <div className="caregiver-password-input">

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Re-enter your password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>

                </div>

                {errors.confirmPassword && (
                  <span className="caregiver-field-error">
                    {errors.confirmPassword}
                  </span>
                )}

              </div>

            </div>

            {/* ================= SUBMIT ================= */}

            <button
              type="submit"
              className="caregiver-create-account-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating Account..."
                : "Create Caregiver Account"}
            </button>

            <p className="caregiver-login-link">
              Already have an account?

              <Link to={ROUTES.LOGIN}>
                Login
              </Link>
            </p>

          </form>

        </div>

      </section>

    </div>
  );
};

export default CaregiverRegister;