import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaCheckCircle, FaShieldAlt } from "react-icons/fa";

import Button from "../../components/Button/Button.jsx";
import { redeemPairingCode } from "../../api/patientDevice.api.js";
import { saveDeviceToken } from "../../utils/patientDeviceStorage.js";
import { APP_NAME, ROUTES } from "../../config/constants.js";

import "./PatientDevicePairing.css";

const CODE_LENGTH = 8;

/* ============================================================
   PATIENT DEVICE PAIRING PAGE

   Standalone, unauthenticated page. Does NOT require a normal
   patient login — the patient never has a username/password.
   A caregiver generates a one-time pairing code from
   Caregiver → Patient Details → Patient Device, and that code
   is entered here to connect this device.

   IMPORTANT: this page intentionally stops at a "Device
   Connected" confirmation. The Patient Dashboard itself is a
   future phase.
============================================================ */

const PatientDevicePairing = () => {
  const navigate = useNavigate();

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pairedPatientName, setPairedPatientName] = useState("");
  const [isPaired, setIsPaired] = useState(false);

  const inputRefs = useRef([]);

  const code = digits.join("");

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const handleDigitChange = (index, rawValue) => {
    const value = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-1);

    setDigits((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });

    setErrorMessage("");

    if (value && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    event.preventDefault();

    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });

    setDigits(next);
    setErrorMessage("");
    focusInput(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (code.length !== CODE_LENGTH) {
      setErrorMessage("Please enter the full 8-character pairing code.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await redeemPairingCode(code);

      saveDeviceToken(response.deviceToken);
      setPairedPatientName(response.patientName || "");
      setIsPaired(true);
    } catch (error) {
      console.error("Unable to pair device:", error);

      const serverMessage = error.response?.data?.message;

      if (error.response?.status === 400) {
        setErrorMessage(
          serverMessage ||
            "That pairing code is invalid, expired, or already used."
        );
      } else {
        setErrorMessage(
          serverMessage || "Something went wrong. Please try again."
        );
      }

      setDigits(Array(CODE_LENGTH).fill(""));
      focusInput(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPaired) {
    return (
      <div className="device-pair">
        <div className="device-pair__card device-pair__card--success">
          <div className="device-pair__success-icon">
            <FaCheckCircle />
          </div>

          <h1>Device Connected ✓</h1>

          <p>
            This device is now connected to your {APP_NAME} account.
          </p>

          {pairedPatientName && (
            <div className="device-pair__patient">
              <span>Patient</span>
              <strong>{pairedPatientName}</strong>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            onClick={() => navigate(ROUTES.PATIENT_DEVICE_DASHBOARD)}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="device-pair">
      <div className="device-pair__card">
        <div className="device-pair__brand">
          <div className="device-pair__brand-icon">
            <FaBrain />
          </div>
          <span>{APP_NAME}</span>
        </div>

        <h1>Set Up Patient Device</h1>
        <p>
          Enter the pairing code provided by your caregiver.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="device-pair__code-row" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                maxLength={1}
                value={digit}
                onChange={(event) =>
                  handleDigitChange(index, event.target.value)
                }
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="device-pair__digit"
                aria-label={`Pairing code character ${index + 1}`}
                disabled={isSubmitting}
              />
            ))}
          </div>

          {errorMessage && (
            <p className="device-pair__error">{errorMessage}</p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            disabled={code.length !== CODE_LENGTH}
          >
            Connect Device
          </Button>
        </form>

        <div className="device-pair__footnote">
          <FaShieldAlt />
          <span>The code expires after 15 minutes.</span>
        </div>
      </div>
    </div>
  );
};

export default PatientDevicePairing;
