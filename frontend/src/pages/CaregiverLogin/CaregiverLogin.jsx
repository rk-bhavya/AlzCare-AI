import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaEnvelope,
  FaBrain,
  FaShieldAlt,
} from "react-icons/fa";

import brain from "../../assets/images/brain.png";

import { loginUser } from "../../api/auth.api.js";
import {
  ROUTES,
  STORAGE_KEYS,
  ROLES,
} from "../../config/constants.js";

import "./CaregiverLogin.css";

const CaregiverLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [serverError, setServerError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  /* ============================================================
     INPUT CHANGE
  ============================================================ */

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
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      newErrors.email =
        "Please enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password =
        "Please enter your password.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      /* --------------------------------------------------------
         ROLE CHECK
      -------------------------------------------------------- */

      if (data.user?.role !== ROLES.CAREGIVER) {
        setServerError(
          "This account does not have caregiver access."
        );

        return;
      }

      /* --------------------------------------------------------
         STORE JWT
      -------------------------------------------------------- */

      localStorage.setItem(
        STORAGE_KEYS.TOKEN,
        data.token
      );

      /* --------------------------------------------------------
         STORE USER
      -------------------------------------------------------- */

      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(data.user)
      );

      /* --------------------------------------------------------
         REDIRECT
      -------------------------------------------------------- */

      navigate(ROUTES.CAREGIVER_DASHBOARD, {
        replace: true,
      });
    } catch (error) {
      console.error("Caregiver login error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to login. Please try again.";

      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================================================
     FORGOT PASSWORD
  ============================================================ */

  const handleForgotPassword = () => {
    /*
     * OTP-based forgot password will be implemented
     * as a separate authentication feature.
     */

    console.log("Forgot password clicked");
  };

  return (
    <div className="caregiver-login">

      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <section className="caregiver-login__visual">

        <div className="caregiver-login__visual-overlay" />

        <button
          type="button"
          className="caregiver-login__back"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          <FaArrowLeft />
          <span>Back to portal</span>
        </button>

        <div className="caregiver-login__visual-content">

          <div className="caregiver-login__brain-wrapper">

            <div className="caregiver-login__brain-glow" />

            <img
              src={brain}
              alt="AI brain illustration"
              className="caregiver-login__brain"
            />

          </div>

          <div className="caregiver-login__brand">

            <div className="caregiver-login__brand-icon">
              <FaBrain />
            </div>

            <div>
              <h2>AlzCare AI</h2>
              <span>Caregiver Portal</span>
            </div>

          </div>

          <h1>
            Caring for memory.
            <br />
            <span>Powered by intelligence.</span>
          </h1>

          <p>
            Monitor your loved one's wellbeing, manage
            daily care, and stay connected with their
            healthcare journey — all from one secure
            platform.
          </p>

          <div className="caregiver-login__security">

            <FaShieldAlt />

            <div>
              <strong>
                Secure Healthcare Access
              </strong>

              <span>
                Your patient's information is protected.
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <section className="caregiver-login__form-section">

        <div className="caregiver-login__form-container">

          {/* MOBILE BRAND */}

          <div className="caregiver-login__mobile-brand">

            <div className="caregiver-login__mobile-icon">
              <FaBrain />
            </div>

            <div>
              <strong>AlzCare AI</strong>
              <span>Caregiver Portal</span>
            </div>

          </div>

          {/* HEADING */}

          <div className="caregiver-login__heading">

            <span className="caregiver-login__eyebrow">
              CAREGIVER ACCESS
            </span>

            <h1>Welcome back!</h1>

            <p>
              Sign in to continue managing your
              patient's care.
            </p>

          </div>

          {/* SERVER ERROR */}

          {serverError && (
            <div className="caregiver-login__server-error">
              {serverError}
            </div>
          )}

          {/* FORM */}

          <form
            className="caregiver-login__form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* EMAIL */}

            <div className="caregiver-login__field">

              <label htmlFor="caregiver-email">
                Email Address
              </label>

              <div
                className={`caregiver-login__input-wrapper ${
                  errors.email
                    ? "caregiver-login__input-wrapper--error"
                    : ""
                }`}
              >

                <FaEnvelope />

                <input
                  id="caregiver-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={isLoading}
                />

              </div>

              {errors.email && (
                <span className="caregiver-login__error">
                  {errors.email}
                </span>
              )}

            </div>

            {/* PASSWORD */}

            <div className="caregiver-login__field">

              <div className="caregiver-login__label-row">

                <label htmlFor="caregiver-password">
                  Password
                </label>

                <button
                  type="button"
                  className="caregiver-login__forgot"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>

              </div>

              <div
                className={`caregiver-login__input-wrapper ${
                  errors.password
                    ? "caregiver-login__input-wrapper--error"
                    : ""
                }`}
              >

                <FaLock />

                <input
                  id="caregiver-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className="caregiver-login__password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

              {errors.password && (
                <span className="caregiver-login__error">
                  {errors.password}
                </span>
              )}

            </div>

            {/* REMEMBER ME */}

            <div className="caregiver-login__options">

              <label className="caregiver-login__remember">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                  disabled={isLoading}
                />

                <span className="caregiver-login__checkbox" />

                <span>Remember me</span>

              </label>

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="caregiver-login__submit"
              disabled={isLoading}
            >

              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>
                    Login to Caregiver Portal
                  </span>

                  <FaArrowLeft className="caregiver-login__submit-arrow" />
                </>
              )}

            </button>

          </form>

          {/* REGISTER */}

          <div className="caregiver-login__register">

            <span>
              Don't have a caregiver account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  ROUTES.CAREGIVER_REGISTER
                )
              }
              disabled={isLoading}
            >
              Create Account
            </button>

          </div>

          {/* MOBILE BACK */}

          <button
            type="button"
            className="caregiver-login__back-mobile"
            onClick={() => navigate(ROUTES.LOGIN)}
          >
            <FaArrowLeft />
            Back to login options
          </button>

          <p className="caregiver-login__footer">
            © 2026 AlzCare AI · Secure healthcare
            platform
          </p>

        </div>

      </section>

    </div>
  );
};

export default CaregiverLogin;