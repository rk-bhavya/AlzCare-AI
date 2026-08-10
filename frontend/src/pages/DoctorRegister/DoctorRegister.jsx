import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaHospital,
  FaIdCard,
  FaMapMarkerAlt,
  FaUpload,
} from "react-icons/fa";

import brain from "../../assets/images/brain.png";

import { registerDoctor } from "../../api/auth.api.js";

import {
  ROUTES,
  STORAGE_KEYS,
} from "../../config/constants.js";

import "./DoctorRegister.css";

const DoctorRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      fullName: "",
      email: "",
      phone: "",
      specialization: "",
      registrationNumber: "",
      hospital: "",
      password: "",
      confirmPassword: "",
      address: "",
    });

  const [profilePicture, setProfilePicture] =
    useState(null);

  const [preview, setPreview] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  const [serverError, setServerError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  /* ============================================================
     HANDLE INPUT
  ============================================================ */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
  };

  /* ============================================================
     PROFILE PICTURE
  ============================================================ */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

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
          "Image size must be less than 5 MB.",
      }));

      return;
    }

    setProfilePicture(file);

    setPreview(
      URL.createObjectURL(file)
    );

    setErrors((previous) => ({
      ...previous,
      profilePicture: "",
    }));
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.phone
      )
    ) {
      newErrors.phone =
        "Enter a valid 10-digit phone number.";
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization =
        "Specialization is required.";
    }

    if (
      !formData.registrationNumber.trim()
    ) {
      newErrors.registrationNumber =
        "Medical registration number is required.";
    }

    if (!formData.hospital.trim()) {
      newErrors.hospital =
        "Hospital or clinic name is required.";
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

    if (!formData.address.trim()) {
      newErrors.address =
        "Address is required.";
    } else if (
      formData.address.trim().length < 5
    ) {
      newErrors.address =
        "Address must contain at least 5 characters.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

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
        "specialization",
        formData.specialization.trim()
      );

      data.append(
        "registrationNumber",
        formData.registrationNumber.trim()
      );

      data.append(
        "hospital",
        formData.hospital.trim()
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
        await registerDoctor(data);

      if (response.token) {
        localStorage.setItem(
          STORAGE_KEYS.TOKEN,
          response.token
        );
      }

      if (response.user) {
        localStorage.setItem(
          STORAGE_KEYS.USER,
          JSON.stringify(
            response.user
          )
        );
      }

      setSuccessMessage(
        "Doctor account created successfully!"
      );

      /*
       * For now, after registration we redirect
       * to the doctor login page.
       *
       * Doctor login will be implemented next.
       */

      setTimeout(() => {
        navigate(
          ROUTES.DOCTOR_LOGIN,
          {
            replace: true,
          }
        );
      }, 1200);
    } catch (error) {
      console.error(
        "Doctor registration error:",
        error
      );

      setServerError(
        error.response?.data?.message ||
          "Unable to create doctor account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="doctor-register">

      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <section className="doctor-register__visual">

        <button
          type="button"
          className="doctor-register__back"
          onClick={() =>
            navigate(ROUTES.LOGIN)
          }
        >
          <FaArrowLeft />
          Back to portal
        </button>

        <div className="doctor-register__visual-content">

          <div className="doctor-register__brain-wrapper">

            <div className="doctor-register__brain-glow" />

            <img
              src={brain}
              alt="AI brain"
              className="doctor-register__brain"
            />

          </div>

          <div className="doctor-register__brand">

            <div className="doctor-register__brand-icon">
              <FaUserMd />
            </div>

            <div>
              <h2>AlzCare AI</h2>
              <span>Doctor Portal</span>
            </div>

          </div>

          <h1>
            Empowering care.
            <br />
            <span>Intelligence for better decisions.</span>
          </h1>

          <p>
            Join AlzCare AI to review AI-assisted
            Alzheimer's assessments, monitor patients,
            and provide informed clinical care.
          </p>

        </div>

      </section>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <section className="doctor-register__form-section">

        <div className="doctor-register__form-container">

          <div className="doctor-register__heading">

            <span className="doctor-register__eyebrow">
              DOCTOR REGISTRATION
            </span>

            <h1>Create your account</h1>

            <p>
              Enter your professional details
              to get started with AlzCare AI.
            </p>

          </div>

          {serverError && (
            <div className="doctor-register__server-error">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="doctor-register__success">
              {successMessage}
            </div>
          )}

          <form
            className="doctor-register__form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* PROFILE PICTURE */}

            <div className="doctor-register__photo">

              <div className="doctor-register__photo-preview">

                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                  />
                ) : (
                  <FaUserMd />
                )}

              </div>

              <label
                htmlFor="doctor-profile-picture"
                className="doctor-register__upload"
              >
                <FaUpload />
                <span>
                  Upload Profile Picture
                </span>
              </label>

              <input
                id="doctor-profile-picture"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
              />

              <small>
                JPG, PNG or WEBP · Max 5 MB
              </small>

              {errors.profilePicture && (
                <span className="doctor-register__error">
                  {errors.profilePicture}
                </span>
              )}

            </div>

            {/* PERSONAL DETAILS */}

            <div className="doctor-register__section-title">
              Personal Information
            </div>

            <div className="doctor-register__grid">

              {/* FULL NAME */}

              <div className="doctor-register__field doctor-register__field--full">

                <label htmlFor="fullName">
                  Full Name
                </label>

                <div className="doctor-register__input-wrapper">

                  <FaUserMd />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Dr. John Smith"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />

                </div>

                {errors.fullName && (
                  <span className="doctor-register__error">
                    {errors.fullName}
                  </span>
                )}

              </div>

              {/* EMAIL */}

              <div className="doctor-register__field">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="doctor-register__input-wrapper">

                  <FaEnvelope />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />

                </div>

                {errors.email && (
                  <span className="doctor-register__error">
                    {errors.email}
                  </span>
                )}

              </div>

              {/* PHONE */}

              <div className="doctor-register__field">

                <label htmlFor="phone">
                  Phone Number
                </label>

                <div className="doctor-register__input-wrapper">

                  <FaPhone />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength="10"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                  />

                </div>

                {errors.phone && (
                  <span className="doctor-register__error">
                    {errors.phone}
                  </span>
                )}

              </div>

            </div>

            {/* PROFESSIONAL DETAILS */}

            <div className="doctor-register__section-title">
              Professional Information
            </div>

            <div className="doctor-register__grid">

              {/* SPECIALIZATION */}

              <div className="doctor-register__field">

                <label htmlFor="specialization">
                  Specialization
                </label>

                <div className="doctor-register__input-wrapper">

                  <FaUserMd />

                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    placeholder="Neurologist"
                    value={
                      formData.specialization
                    }
                    onChange={handleChange}
                    disabled={isLoading}
                  />

                </div>

                {errors.specialization && (
                  <span className="doctor-register__error">
                    {errors.specialization}
                  </span>
                )}

              </div>

              {/* REGISTRATION NUMBER */}

              <div className="doctor-register__field">

                <label htmlFor="registrationNumber">
                  Medical Registration No.
                </label>

                <div className="doctor-register__input-wrapper">

                  <FaIdCard />

                  <input
                    id="registrationNumber"
                    name="registrationNumber"
                    type="text"
                    placeholder="KMC123456"
                    value={
                      formData.registrationNumber
                    }
                    onChange={handleChange}
                    disabled={isLoading}
                  />

                </div>

                {errors.registrationNumber && (
                  <span className="doctor-register__error">
                    {
                      errors.registrationNumber
                    }
                  </span>
                )}

              </div>

              {/* HOSPITAL */}

              <div className="doctor-register__field doctor-register__field--full">

                <label htmlFor="hospital">
                  Hospital / Clinic
                </label>

                <div className="doctor-register__input-wrapper">

                  <FaHospital />

                  <input
                    id="hospital"
                    name="hospital"
                    type="text"
                    placeholder="City Care Hospital"
                    value={formData.hospital}
                    onChange={handleChange}
                    disabled={isLoading}
                  />

                </div>

                {errors.hospital && (
                  <span className="doctor-register__error">
                    {errors.hospital}
                  </span>
                )}

              </div>

            </div>

            {/* ADDRESS */}

            <div className="doctor-register__field">

              <label htmlFor="address">
                Address
              </label>

              <div className="doctor-register__input-wrapper doctor-register__input-wrapper--textarea">

                <FaMapMarkerAlt />

                <textarea
                  id="address"
                  name="address"
                  placeholder="Hospital / clinic address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isLoading}
                />

              </div>

              {errors.address && (
                <span className="doctor-register__error">
                  {errors.address}
                </span>
              )}

            </div>

            {/* SECURITY */}

            <div className="doctor-register__section-title">
              Account Security
            </div>

            <div className="doctor-register__grid">

              {/* PASSWORD */}

              <div className="doctor-register__field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="doctor-register__input-wrapper">

                  <FaLock />

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
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="doctor-register__eye"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
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
                  <span className="doctor-register__error">
                    {errors.password}
                  </span>
                )}

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="doctor-register__field">

                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <div className="doctor-register__input-wrapper">

                  <FaLock />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Re-enter password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="doctor-register__eye"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) =>
                          !previous
                      )
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
                  <span className="doctor-register__error">
                    {
                      errors.confirmPassword
                    }
                  </span>
                )}

              </div>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="doctor-register__submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Creating Account..."
                : "Create Doctor Account →"}
            </button>

          </form>

          {/* LOGIN */}

          <div className="doctor-register__login">

            <span>
              Already have a doctor account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  ROUTES.DOCTOR_LOGIN
                )
              }
            >
              Login
            </button>

          </div>

        </div>

      </section>

    </div>
  );
};

export default DoctorRegister;