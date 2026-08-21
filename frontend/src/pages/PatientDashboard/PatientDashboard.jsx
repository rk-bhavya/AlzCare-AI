import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaCheckCircle,
  FaArrowLeft,
  FaSpinner,
} from "react-icons/fa";

import {
  getMyProfile,
  getMyTodaysMedications,
  markMyMedicationTaken,
  getMyDailyTasks,
  completeMyDailyTask,
  createMyCognitiveActivity,
  requestHelp,
  updateMyLocation,
  recognizeFamilyMember,
} from "../../api/patientDevice.api.js";

import {
  hasDeviceToken,
  clearDeviceToken,
} from "../../utils/patientDeviceStorage.js";

import { ROUTES } from "../../config/constants.js";

import MemoryGame from "../CaregiverCognitive/games/MemoryGame.jsx";
import NumberRecallGame from "../CaregiverCognitive/games/NumberRecallGame.jsx";
import PatternRecognitionGame from "../CaregiverCognitive/games/PatternRecognitionGame.jsx";
import WordRecallGame from "../CaregiverCognitive/games/WordRecallGame.jsx";

import "./PatientDashboard.css";

/* ============================================================
   PATIENT DASHBOARD

   Identity comes ENTIRELY from the device token (see
   patientDeviceAxios.js -> x-device-token -> backend
   protectPatientDevice -> req.patient). This page never asks
   for or trusts a patientId.

   Deliberately simple: large text, large buttons, minimal
   choices, high contrast — the opposite of the data-dense
   Caregiver Dashboard.
============================================================ */

const GAMES = [
  { key: "memory-game", label: "Memory Game", icon: "🧠" },
  { key: "number-recall", label: "Number Recall", icon: "🔢" },
  { key: "pattern-recognition", label: "Patterns", icon: "🎨" },
  { key: "word-recall", label: "Word Recall", icon: "📝" },
];

const formatTime12h = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const hasRequestedLocation = useRef(false);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [patientName, setPatientName] = useState("");
  const [medications, setMedications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskSummary, setTaskSummary] = useState({
    total: 0,
    completed: 0,
  });

  const [screen, setScreen] = useState("home"); // home | game-select | playing
  const [activeGame, setActiveGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  const [helpMessage, setHelpMessage] = useState("");
  const [isSendingHelp, setIsSendingHelp] = useState(false);

  const [locationStatus, setLocationStatus] = useState("idle");
  const [busyKey, setBusyKey] = useState("");
  const [recognitionOpen, setRecognitionOpen] = useState(false);
  const [recognitionMessage, setRecognitionMessage] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
  };

  useEffect(() => () => stopCamera(), []);

  const startRecognition = async () => {
    setRecognitionMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecognitionMessage("No camera is available on this device.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      cameraStreamRef.current = stream;
      setRecognitionOpen(true);
      // The video element is mounted after state updates.
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 0);
    } catch (error) {
      setRecognitionMessage(error.name === "NotAllowedError" ? "Please allow camera access." : "Unable to start the camera.");
    }
  };

  const closeRecognition = () => {
    stopCamera();
    setRecognitionOpen(false);
    setIsRecognizing(false);
  };

  const captureAndRecognize = async () => {
    const video = videoRef.current;
    if (!video?.videoWidth) { setRecognitionMessage("Camera is still starting. Please try again."); return; }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      setIsRecognizing(true);
      setRecognitionMessage("");
      const image = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!image) throw new Error("Could not capture image");
      const result = await recognizeFamilyMember(image);
      stopCamera();
      setRecognitionMessage(result.recognized ? `Hello ${result.name} ❤️\n${result.relationship}` : "Person not recognized.");
    } catch (error) {
      stopCamera();
      setRecognitionMessage(error.response?.data?.message || "Unable to recognize this person right now.");
    } finally {
      setIsRecognizing(false);
    }
  };

  const goToPairing = () => {
    clearDeviceToken();
    navigate(ROUTES.PATIENT_DEVICE_PAIR, { replace: true });
  };

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const [profile, medsRes, tasksRes] = await Promise.all([
        getMyProfile(),
        getMyTodaysMedications(),
        getMyDailyTasks(),
      ]);

      setPatientName(profile.patient?.fullName || "");
      setMedications(medsRes.schedule || []);
      setTasks(tasksRes.tasks || []);
      setTaskSummary(
        tasksRes.summary || { total: 0, completed: 0, pending: 0 }
      );
    } catch (error) {
      console.error("Unable to load patient dashboard:", error);

      if (error.response?.status === 401) {
        goToPairing();
        return;
      }

      setLoadError(
        error.response?.data?.message ||
          "Unable to load your information right now."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasDeviceToken()) {
      navigate(ROUTES.PATIENT_DEVICE_PAIR, { replace: true });
      return;
    }

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * GPS FOUNDATION — request once per dashboard visit, never
   * aggressively polled. Silently no-ops if permission is denied
   * or geolocation is unavailable; never claims success it
   * didn't actually get.
   */
  useEffect(() => {
    if (hasRequestedLocation.current) return;
    hasRequestedLocation.current = true;

    if (!("geolocation" in navigator)) {
      setLocationStatus("unavailable");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await updateMyLocation(
            position.coords.latitude,
            position.coords.longitude
          );
          setLocationStatus("shared");
        } catch (error) {
          console.error("Unable to send location:", error);
          setLocationStatus("error");
        }
      },
      (error) => {
        console.warn("Geolocation permission not granted:", error.message);
        setLocationStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  const handleMarkTaken = async (medicationId, time) => {
    const key = `${medicationId}_${time}`;

    try {
      setBusyKey(key);
      await markMyMedicationTaken(medicationId, time);
      await loadDashboard();
    } catch (error) {
      console.error("Unable to mark medication taken:", error);
    } finally {
      setBusyKey("");
    }
  };

  const handleToggleTask = async (task) => {
    try {
      setBusyKey(task._id);
      await completeMyDailyTask(task._id, !task.isCompleted);
      await loadDashboard();
    } catch (error) {
      console.error("Unable to update task:", error);
    } finally {
      setBusyKey("");
    }
  };

  const handleStartGame = (gameKey) => {
    setActiveGame(gameKey);
    setGameResult(null);
    setScreen("playing");
  };

  const handleGameComplete = async ({ score, durationSeconds }) => {
    setGameResult({ score, durationSeconds });

    try {
      await createMyCognitiveActivity({
        activityType: activeGame,
        score,
        durationSeconds,
      });
    } catch (error) {
      console.error("Unable to save activity result:", error);
    }
  };

  const handleRequestHelp = async () => {
    try {
      setIsSendingHelp(true);
      setHelpMessage("");

      const response = await requestHelp();
      setHelpMessage(response.message || "Your caregiver has been notified.");
    } catch (error) {
      console.error("Unable to send help request:", error);
      setHelpMessage(
        error.response?.data?.message ||
          "Unable to send your help request right now."
      );
    } finally {
      setIsSendingHelp(false);
      setTimeout(() => setHelpMessage(""), 6000);
    }
  };

  if (isLoading) {
    return (
      <div className="patient-dash patient-dash--center">
        <FaSpinner className="patient-dash__spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="patient-dash patient-dash--center">
        <p>{loadError}</p>
        <button className="patient-btn patient-btn--primary" onClick={loadDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  /* ============================================================
     GAME PLAY SCREEN
  ============================================================ */
  if (screen === "playing") {
    const gameLabel = GAMES.find((g) => g.key === activeGame)?.label;

    return (
      <div className="patient-dash">
        <button
          className="patient-back-btn"
          onClick={() => {
            setScreen("home");
            setActiveGame(null);
            setGameResult(null);
          }}
        >
          <FaArrowLeft /> Back
        </button>

        <div className="patient-card patient-card--game">
          <h2>{gameLabel}</h2>

          {gameResult ? (
            <div className="patient-game-result">
              <FaCheckCircle className="patient-game-result__icon" />
              <p>Great job!</p>
              <span>Score: {gameResult.score} / 100</span>

              <button
                className="patient-btn patient-btn--primary"
                onClick={() => {
                  setScreen("home");
                  setActiveGame(null);
                  setGameResult(null);
                }}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {activeGame === "memory-game" && (
                <MemoryGame onComplete={handleGameComplete} />
              )}
              {activeGame === "number-recall" && (
                <NumberRecallGame onComplete={handleGameComplete} />
              )}
              {activeGame === "pattern-recognition" && (
                <PatternRecognitionGame onComplete={handleGameComplete} />
              )}
              {activeGame === "word-recall" && (
                <WordRecallGame onComplete={handleGameComplete} />
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  /* ============================================================
     GAME SELECT SCREEN
  ============================================================ */
  if (screen === "game-select") {
    return (
      <div className="patient-dash">
        <button className="patient-back-btn" onClick={() => setScreen("home")}>
          <FaArrowLeft /> Back
        </button>

        <h1 className="patient-dash__title">Choose an Activity</h1>

        <div className="patient-game-grid">
          {GAMES.map((game) => (
            <button
              key={game.key}
              className="patient-game-tile"
              onClick={() => handleStartGame(game.key)}
            >
              <span className="patient-game-tile__icon">{game.icon}</span>
              <span>{game.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ============================================================
     HOME SCREEN
  ============================================================ */
  const firstName = patientName.split(" ")[0] || "there";
  const pendingMeds = medications.filter((m) => m.status !== "taken");

  return (
    <div className="patient-dash">
      <h1 className="patient-dash__greeting">
        Good Morning, {firstName} <span>❤️</span>
      </h1>
      <p className="patient-dash__subtitle">How are you today?</p>

      <h2 className="patient-dash__section-title">TODAY</h2>

      {/* COGNITIVE ACTIVITY */}
      <div className="patient-card">
        <div className="patient-card__icon">🧠</div>
        <h3>Cognitive Activity</h3>
        <p>Exercise your memory today.</p>
        <button
          className="patient-btn patient-btn--primary"
          onClick={() => setScreen("game-select")}
        >
          START
        </button>
      </div>

      {/* MEDICATION */}
      <div className="patient-card">
        <div className="patient-card__icon">💊</div>
        <h3>Medication</h3>

        {medications.length === 0 ? (
          <p>No medication scheduled for today.</p>
        ) : (
          <div className="patient-med-list">
            {medications.map((med) => {
              const key = `${med.medicationId}_${med.time}`;
              const isBusy = busyKey === key;

              return (
                <div className="patient-med-item" key={key}>
                  <div>
                    <strong>{med.name}</strong>
                    <span>{formatTime12h(med.time)}</span>
                  </div>

                  {med.status === "taken" ? (
                    <span className="patient-med-status patient-med-status--taken">
                      Taken ✓
                    </span>
                  ) : (
                    <button
                      className="patient-btn patient-btn--secondary"
                      disabled={isBusy}
                      onClick={() => handleMarkTaken(med.medicationId, med.time)}
                    >
                      {isBusy ? "..." : "Mark Taken"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TODAY'S TASKS */}
      <div className="patient-card">
        <div className="patient-card__icon">📋</div>
        <h3>Today's Tasks</h3>

        {taskSummary.total === 0 ? (
          <p>No tasks configured for today.</p>
        ) : (
          <>
            <p className="patient-task-summary">
              {taskSummary.completed} of {taskSummary.total} completed
            </p>

            <div className="patient-task-list">
              {tasks.map((task) => (
                <button
                  key={task._id}
                  className={`patient-task-item ${
                    task.isCompleted ? "patient-task-item--done" : ""
                  }`}
                  onClick={() => handleToggleTask(task)}
                  disabled={busyKey === task._id}
                >
                  <span className="patient-task-checkbox">
                    {task.isCompleted ? "☑" : "☐"}
                  </span>
                  <span>{task.title}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAMILY RECOGNITION */}
      <div className="patient-card">
        <div className="patient-card__icon">👨‍👩‍👧</div>
        <h3>Family Recognition</h3>
        <p>Recognize a family member.</p>
        <button className="patient-btn patient-btn--primary" onClick={startRecognition}>START RECOGNITION</button>
        {!recognitionOpen && recognitionMessage && <p className="patient-recognition-message">{recognitionMessage}</p>}
      </div>

      {recognitionOpen && (
        <div className="patient-camera-overlay" role="dialog" aria-modal="true" aria-label="Family recognition camera">
          <div className="patient-camera-card">
            <h2>Family Recognition</h2>
            <p>Position your face inside the frame.</p>
            {recognitionMessage ? <p className="patient-recognition-message">{recognitionMessage}</p> : <video ref={videoRef} autoPlay playsInline muted className="patient-camera-preview" />}
            <div className="patient-camera-actions">
              {!recognitionMessage && <button className="patient-btn patient-btn--primary" disabled={isRecognizing} onClick={captureAndRecognize}>{isRecognizing ? "RECOGNIZING..." : "RECOGNIZE"}</button>}
              <button className="patient-btn patient-btn--secondary" onClick={closeRecognition}>{recognitionMessage ? "DONE" : "CANCEL"}</button>
            </div>
          </div>
        </div>
      )}

      {/* HELP */}
      <div className="patient-help">
        {helpMessage && <p className="patient-help__message">{helpMessage}</p>}

        <button
          className="patient-help-btn"
          onClick={handleRequestHelp}
          disabled={isSendingHelp}
        >
          🆘 NEED HELP
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;
