import { useState } from "react";

import { requestHelp } from "../../../api/patientDevice.api.js";

/* ============================================================
   PATIENT HELP

   Uses the existing POST /patient-devices/me/help (which
   notifies the assigned caregiver through the existing
   notification system). A confirmation step prevents accidental
   presses. Success text is shown only after the API actually
   succeeds.

   Location status reflects only what the existing GPS logic in
   PatientDashboard really did (permission result and the time
   of the last successful updateMyLocation call). No coordinates
   are displayed or invented.
============================================================ */

const LOCATION_TEXT = {
  idle: { label: "Checking...", tone: "muted" },
  loading: { label: "Checking...", tone: "muted" },
  shared: { label: "Active", tone: "ok" },
  denied: { label: "Off — location permission not allowed", tone: "warn" },
  unavailable: { label: "Not available on this device", tone: "warn" },
  error: { label: "Couldn't update just now", tone: "warn" },
};

const PatientHelp = ({ locationStatus, lastLocationUpdateAt }) => {
  const [step, setStep] = useState("idle"); // idle | confirm | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    try {
      setStep("sending");
      setErrorMessage("");
      await requestHelp();
      setStep("sent");
    } catch (error) {
      console.error("Unable to send help request:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "We couldn't reach your caregiver. Please try again."
      );
      setStep("error");
    }
  };

  const location = LOCATION_TEXT[locationStatus] || LOCATION_TEXT.idle;

  return (
    <div>
      <h1 className="patient-dash__title">🆘 Help</h1>

      {step === "sent" ? (
        <div className="patient-card patient-result patient-result--ok">
          <div className="patient-card__icon">✅</div>
          <h3>Your caregiver has been notified.</h3>
          <p>Stay where you are. Help is on the way.</p>
          <button
            className="patient-btn patient-btn--primary patient-btn--block"
            onClick={() => setStep("idle")}
          >
            OK
          </button>
        </div>
      ) : (
        <>
          {step === "error" && (
            <div className="patient-card patient-result patient-result--error">
              <h3>Help request not sent</h3>
              <p>{errorMessage}</p>
            </div>
          )}

          <button
            type="button"
            className="patient-help-big"
            onClick={() => setStep("confirm")}
            disabled={step === "sending"}
          >
            <span className="patient-help-big__icon">🆘</span>
            <span>CALL MY CAREGIVER</span>
          </button>
        </>
      )}

      {/* LOCATION */}
      <div className="patient-card patient-location">
        <h3>📍 Location sharing</h3>
        <p className={`patient-location__status patient-location__status--${location.tone}`}>
          {location.label}
        </p>
        {locationStatus === "shared" && lastLocationUpdateAt && (
          <p className="patient-location__time">
            Last updated:{" "}
            {lastLocationUpdateAt.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {/* CONFIRMATION */}
      {(step === "confirm" || step === "sending") && (
        <div className="patient-overlay">
          <div className="patient-confirm">
            <div className="patient-card__icon">🆘</div>
            <h2>Do you need help?</h2>
            <p>Your caregiver will be told right away.</p>

            <button
              className="patient-btn patient-btn--danger patient-btn--block"
              onClick={handleConfirm}
              disabled={step === "sending"}
            >
              {step === "sending" ? "Sending..." : "Yes, I need help"}
            </button>

            <button
              className="patient-btn patient-btn--secondary patient-btn--block"
              onClick={() => setStep("idle")}
              disabled={step === "sending"}
            >
              No, I'm okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHelp;
