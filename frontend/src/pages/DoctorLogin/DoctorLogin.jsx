import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaUserMd,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";

import brain from "../../assets/images/brain.png";

import { loginUser } from "../../api/auth.api.js";

import {
  ROUTES,
  STORAGE_KEYS,
} from "../../config/constants.js";

import "./DoctorLogin.css";

const DoctorLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /* ---------------- VALIDATION ---------------- */

    if (!email.trim()) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    try {
      setIsLoading(true);

      /* ---------------- API REQUEST ---------------- */

      const response = await loginUser({
        email: email.trim(),
        password,
        role: "doctor",
      });

      /* ---------------- SAFETY ROLE CHECK ---------------- */

      if (
        !response.user ||
        response.user.role !== "doctor"
      ) {
        setError(
          "This account does not have doctor access."
        );
        return;
      }

      /* ---------------- SAVE TOKEN ---------------- */

      localStorage.setItem(
        STORAGE_KEYS.TOKEN,
        response.token
      );

      /* ---------------- SAVE USER ---------------- */

      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(
          response.user
        )
      );

      /* ---------------- REDIRECT ---------------- */

      navigate(
        ROUTES.DOCTOR_DASHBOARD,
        {
          replace: true,
        }
      );
    } catch (err) {
      console.error(
        "Doctor login error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="doctor-login">

      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <section className="doctor-login__visual">

        <button
          type="button"
          className="doctor-login__back"
          onClick={() =>
            navigate(ROUTES.LOGIN)
          }
        >
          <FaArrowLeft />
          Back to portal
        </button>

        <div className="doctor-login__visual-content">

          <span className="doctor-login__tag">
            AI • HEALTHCARE • DOCTOR
          </span>

          <div className="doctor-login__brain-wrapper">

            <div className="doctor-login__brain-glow" />

            <img
              src={brain}
              alt="AI brain"
              className="doctor-login__brain"
            />

          </div>

          <div className="doctor-login__brand">

            <div className="doctor-login__brand-icon">
              <FaUserMd />
            </div>

            <div>
              <h2>AlzCare AI</h2>
              <span>Doctor Portal</span>
            </div>

          </div>

          <h1>
            Welcome back,
            <br />
            <span>Doctor.</span>
          </h1>

          <p>
            Review AI-assisted Alzheimer's
            assessments, monitor patient
            progress and provide informed
            clinical care.
          </p>

        </div>

      </section>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <section className="doctor-login__form-section">

        <div className="doctor-login__form-container">

          <div className="doctor-login__heading">

            <span className="doctor-login__eyebrow">
              DOCTOR PORTAL
            </span>

            <h1>
              Welcome back
            </h1>

            <p>
              Sign in to access your
              clinical dashboard.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="doctor-login__error">
              {error}
            </div>
          )}

          <form
            className="doctor-login__form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="doctor-login__field">

              <label htmlFor="doctor-email">
                Email Address
              </label>

              <div className="doctor-login__input-wrapper">

                <FaEnvelope />

                <input
                  id="doctor-email"
                  type="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );
                    setError("");
                  }}
                  disabled={isLoading}
                  autoComplete="email"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="doctor-login__field">

              <div className="doctor-login__label-row">

                <label htmlFor="doctor-password">
                  Password
                </label>

                <button
                  type="button"
                  className="doctor-login__forgot"
                  onClick={() => {
                    alert(
                      "Forgot Password will be implemented in the next authentication feature."
                    );
                  }}
                >
                  Forgot Password?
                </button>

              </div>

              <div className="doctor-login__input-wrapper">

                <FaLock />

                <input
                  id="doctor-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value
                    );
                    setError("");
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="doctor-login__eye"
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

            </div>

            {/* LOGIN */}

            <button
              type="submit"
              className="doctor-login__submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Signing in..."
                : "Login to Doctor Portal →"}
            </button>

          </form>

          {/* SECURITY */}

          <div className="doctor-login__security">

            <FaShieldAlt />

            <span>
              Secure login protected by
              JWT authentication
            </span>

          </div>

          {/* REGISTER */}

          <div className="doctor-login__register">

            <span>
              Don't have a doctor account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  ROUTES.DOCTOR_REGISTER
                )
              }
            >
              Create Account
            </button>

          </div>

        </div>

      </section>

    </div>
  );
};

export default DoctorLogin;