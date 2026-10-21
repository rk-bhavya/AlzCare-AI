import { useCallback, useEffect, useRef, useState } from "react";

/* ============================================================
   PATIENT FAMILY RECOGNITION

   States: ready -> starting -> active -> recognizing ->
           recognized | unknown | error

   The camera is REAL (browser getUserMedia) and the capture is
   a real frame from it.

   IMPORTANT — no recognition endpoint exists yet:
   The existing patient-device API (patientDevice.api.js) has NO
   face-recognition function. The only face-related backend piece
   found is the Python /face/embedding service, which is meant to
   be called by the trusted Node.js backend, not by a patient
   device, and nothing matches an embedding against FamilyMember
   photos. So this component does NOT invent a result.

   It accepts an optional `onRecognize(imageBlob)` prop. When a
   real patient-device endpoint is wired up, that function must
   resolve to one of:
     { status: "recognized", name, relationship }
     { status: "unknown" }
   and the UI below will show the matching state. Until then
   (onRecognize undefined) a scan ends in the "error" state with
   an honest "not connected yet" message — never a fake name.

   The "caregiver has been notified" text is shown only in the
   "unknown" state, which can only be reached through a real
   onRecognize result; the backend call is what must actually
   notify the caregiver.
============================================================ */

const PatientFamily = ({ onRecognize }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [state, setState] = useState("ready");
  const [errorMessage, setErrorMessage] = useState("");
  const [match, setMatch] = useState(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Always release the camera when leaving this screen.
  useEffect(() => stopCamera, [stopCamera]);

  const startCamera = async () => {
    setErrorMessage("");
    setMatch(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage("This device does not support using the camera.");
      setState("error");
      return;
    }

    try {
      setState("starting");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setState("active");
    } catch (error) {
      console.error("Camera error:", error);
      stopCamera();
      setErrorMessage(
        error?.name === "NotAllowedError"
          ? "Camera permission was not allowed. Please ask your caregiver for help."
          : "We couldn't start the camera."
      );
      setState("error");
    }
  };

  const captureFrame = () =>
    new Promise((resolve, reject) => {
      const video = videoRef.current;

      if (!video || !video.videoWidth) {
        reject(new Error("Camera image is not ready yet."));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Unable to capture photo.")),
        "image/jpeg",
        0.9
      );
    });

  const handleScan = async () => {
    try {
      const imageBlob = await captureFrame();

      setState("recognizing");

      if (typeof onRecognize !== "function") {
        // No real recognition service is connected — be honest.
        stopCamera();
        setErrorMessage(
          "Family recognition isn't connected yet. Please check back soon."
        );
        setState("error");
        return;
      }

      const result = await onRecognize(imageBlob);
      stopCamera();

      if (result?.status === "recognized" && result.name) {
        setMatch({ name: result.name, relationship: result.relationship });
        setState("recognized");
      } else if (result?.status === "unknown") {
        setState("unknown");
      } else {
        throw new Error("Unexpected recognition response.");
      }
    } catch (error) {
      console.error("Recognition error:", error);
      stopCamera();
      setErrorMessage("Something went wrong. Please try again.");
      setState("error");
    }
  };

  const reset = () => {
    stopCamera();
    setMatch(null);
    setErrorMessage("");
    setState("ready");
  };

  const cameraVisible = state === "starting" || state === "active" || state === "recognizing";

  return (
    <div>
      <h1 className="patient-dash__title">👪 Family</h1>

      {state === "ready" && (
        <div className="patient-card">
          <div className="patient-card__icon">📷</div>
          <h3>Who is this?</h3>
          <p>Hold the camera up to the person's face, then tap Scan.</p>
          <button
            className="patient-btn patient-btn--primary patient-btn--block"
            onClick={startCamera}
          >
            Open Camera
          </button>
        </div>
      )}

      {/* The <video> stays mounted while the camera is in use. */}
      <div
        className="patient-camera"
        style={{ display: cameraVisible ? "block" : "none" }}
      >
        <video ref={videoRef} playsInline muted className="patient-camera__video" />

        {state === "starting" && (
          <p className="patient-camera__note">Starting camera...</p>
        )}
        {state === "recognizing" && (
          <p className="patient-camera__note">Recognizing...</p>
        )}
      </div>

      {state === "active" && (
        <div className="patient-camera__actions">
          <button
            className="patient-btn patient-btn--primary patient-btn--block"
            onClick={handleScan}
          >
            📷 Scan
          </button>
          <button
            className="patient-btn patient-btn--secondary patient-btn--block"
            onClick={reset}
          >
            Cancel
          </button>
        </div>
      )}

      {state === "recognized" && match && (
        <div className="patient-card patient-result patient-result--ok">
          <div className="patient-card__icon">😊</div>
          <h3>This is {match.name}</h3>
          {match.relationship && (
            <p className="patient-result__relation">
              Your {match.relationship}
            </p>
          )}
          <button
            className="patient-btn patient-btn--primary patient-btn--block"
            onClick={reset}
          >
            Done
          </button>
        </div>
      )}

      {state === "unknown" && (
        <div className="patient-card patient-result patient-result--unknown">
          <div className="patient-card__icon">❓</div>
          <h3>We don't know this person</h3>
          <p>Your caregiver has been notified. You are safe.</p>
          <button
            className="patient-btn patient-btn--primary patient-btn--block"
            onClick={reset}
          >
            OK
          </button>
        </div>
      )}

      {state === "error" && (
        <div className="patient-card patient-result patient-result--error">
          <div className="patient-card__icon">⚠️</div>
          <h3>Can't scan right now</h3>
          <p>{errorMessage}</p>
          <button
            className="patient-btn patient-btn--primary patient-btn--block"
            onClick={reset}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientFamily;
