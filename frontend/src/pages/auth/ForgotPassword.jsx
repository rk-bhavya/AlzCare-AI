import "./ForgotPassword.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaEnvelope,
  FaMobileAlt,
  FaLock,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { API_BASE_URL, ROUTES } from "../../config/constants";

function ForgotPassword() {
  const navigate = useNavigate();

  const [method, setMethod] = useState("email");
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ============================================================
     SEND OTP
  ============================================================ */

  const handleSendOTP = async (e) => {
  e.preventDefault();

  setError("");
  setMessage("");

  if (method === "email" && !email.trim()) {
    setError("Please enter your email address.");
    return;
  }

  if (method === "phone" && !phone.trim()) {
    setError("Please enter your phone number.");
    return;
  }

  try {
    setLoading(true);

    const response = await axios.post(
      `${API_BASE_URL}/auth/forgot-password`,
      method === "email"
        ? {
            email: email.trim().toLowerCase(),
            method: "email",
          }
        : {
            phone: phone.trim(),
            method: "phone",
          }
    );

    setMessage(response.data.message);

    setStep(2);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to send OTP. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
  /* ============================================================
     VERIFY OTP
  ============================================================ */

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must contain exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
  `${API_BASE_URL}/auth/verify-otp`,
  method === "email"
    ? {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      }
    : {
        phone: phone.trim(),
        otp: otp.trim(),
      }
);

      setMessage(response.data.message);

      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RESET PASSWORD
  ============================================================ */

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
  `${API_BASE_URL}/auth/reset-password`,
  method === "email"
    ? {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      }
    : {
        phone: phone.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      }
);

      setMessage(response.data.message);

      setStep(4);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     STEP INDICATOR
  ============================================================ */

  const getStepTitle = () => {
    if (step === 1) return "Reset your password";
    if (step === 2) return "Verify your identity";
    if (step === 3) return "Create new password";
    return "Password reset successful";
  };

  return (
    <div className="forgot-password-page">

      {/* LEFT SECTION */}

      <div className="forgot-left">

        <button
          className="back-home-btn"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          <FaArrowLeft />
          Back to Login
        </button>

        <div className="forgot-brand">
          <div className="forgot-brand-icon">
            <FaShieldAlt />
          </div>

          <span>AlzCare AI</span>
        </div>

        <div className="forgot-left-content">

          <span className="forgot-tag">
            SECURE ACCOUNT RECOVERY
          </span>

          <h1>
            Stay secure.
            <br />
            <span>Stay connected.</span>
          </h1>

          <p>
            Recover your AlzCare AI account securely
            using a verification code sent to your
            registered contact.
          </p>

          <div className="security-points">

            <div>
              <FaShieldAlt />
              <span>Secure OTP verification</span>
            </div>

            <div>
              <FaLock />
              <span>Password protected account</span>
            </div>

            <div>
              <FaEnvelope />
              <span>Private and secure recovery</span>
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SECTION */}

      <div className="forgot-right">

        <div className="forgot-card">

          {/* STEP INDICATOR */}

          <div className="forgot-steps">

            <div
              className={
                step >= 1
                  ? "forgot-step active"
                  : "forgot-step"
              }
            >
              <span>1</span>
              <small>Contact</small>
            </div>

            <div className="step-line" />

            <div
              className={
                step >= 2
                  ? "forgot-step active"
                  : "forgot-step"
              }
            >
              <span>2</span>
              <small>Verify</small>
            </div>

            <div className="step-line" />

            <div
              className={
                step >= 3
                  ? "forgot-step active"
                  : "forgot-step"
              }
            >
              <span>3</span>
              <small>Password</small>
            </div>

          </div>

          <div className="forgot-header">

            <h2>{getStepTitle()}</h2>

            {step === 1 && (
              <p>
                Choose how you'd like to receive
                your verification code.
              </p>
            )}

            {step === 2 && (
              <p>
                Enter the 6-digit OTP sent to your
                registered email.
              </p>
            )}

            {step === 3 && (
              <p>
                Create a strong new password for
                your account.
              </p>
            )}

            {step === 4 && (
              <p>
                Your password has been changed
                successfully.
              </p>
            )}

          </div>

          {/* ERROR */}

          {error && (
            <div className="forgot-message error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {message && (
            <div className="forgot-message success">
              {message}
            </div>
          )}

          {/* ==================================================
              STEP 1
          ================================================== */}

          {step === 1 && (
            <form
              onSubmit={handleSendOTP}
              className="forgot-form"
            >

              <div className="method-selector">

                <button
                  type="button"
                  className={
                    method === "email"
                      ? "method-card selected"
                      : "method-card"
                  }
                  onClick={() => {
                    setMethod("email");
                    setError("");
                  }}
                >
                  <FaEnvelope />

                  <div>
                    <strong>Email OTP</strong>
                    <span>
                      Receive code by email
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className={
                    method === "phone"
                      ? "method-card selected"
                      : "method-card"
                  }
                  onClick={() => {
                    setMethod("phone");
                    setError("");
                  }}
                >
                  <FaMobileAlt />

                  <div>
                    <strong>Phone OTP</strong>
                    <span>
                      Receive code by SMS
                    </span>
                  </div>
                </button>

              </div>

              {method === "email" && (
                <div className="input-group">

                  <label>
                    Registered Email
                  </label>

                  <div className="input-wrapper">

                    <FaEnvelope />

                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                    />

                  </div>

                </div>
              )}

              {method === "phone" && (
                <div className="input-group">

                  <label>
                    Registered Phone Number
                  </label>

                  <div className="input-wrapper">

                    <FaMobileAlt />

                    <input
                      type="tel"
                      placeholder="Enter your registered phone"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                    />

                  </div>

                </div>
              )}

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Sending OTP..."
                  : "Send Verification Code"}
              </button>

            </form>
          )}

          {/* ==================================================
              STEP 2
          ================================================== */}

          {step === 2 && (
            <form
              onSubmit={handleVerifyOTP}
              className="forgot-form"
            >

              <div className="otp-info">
  {method === "email" ? (
    <FaEnvelope />
  ) : (
    <FaMobileAlt />
  )}

  <p>
    We've sent a 6-digit verification code to:
    <strong>
      {method === "email" ? email : phone}
    </strong>
  </p>
</div>

              <div className="input-group">

                <label>Enter OTP</label>

                <input
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />

              </div>

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
              >
                {method === "email"
  ? "Change Email"
  : "Change Phone Number"}
              </button>

            </form>
          )}

          {/* ==================================================
              STEP 3
          ================================================== */}

          {step === 3 && (
            <form
              onSubmit={handleResetPassword}
              className="forgot-form"
            >

              <div className="input-group">

                <label>New Password</label>

                <div className="input-wrapper">

                  <FaLock />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
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

              </div>

              <div className="input-group">

                <label>
                  Confirm New Password
                </label>

                <div className="input-wrapper">

                  <FaLock />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
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

              </div>

              <div className="password-rule">
                Password must contain at least 8
                characters.
              </div>

              <button
                type="submit"
                className="forgot-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Updating Password..."
                  : "Reset Password"}
              </button>

            </form>
          )}

          {/* ==================================================
              STEP 4
          ================================================== */}

          {step === 4 && (
            <div className="reset-success">

              <div className="success-icon">
                ✓
              </div>

              <h3>Password Reset Complete!</h3>

              <p>
                Your password has been updated
                successfully. You can now log in
                using your new password.
              </p>

              <button
                className="forgot-submit-btn"
                onClick={() =>
                  navigate(ROUTES.LOGIN)
                }
              >
                Back to Login
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;