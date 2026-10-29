import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyProfile,
  getMyTodaysMedications,
  markMyMedicationTaken,
  getMyDailyTasks,
  completeMyDailyTask,
  getMyCognitiveActivityToday,
  updateMyLocation,
} from "../../api/patientDevice.api.js";

import {
  hasDeviceToken,
  clearDeviceToken,
} from "../../utils/patientDeviceStorage.js";

import { ROUTES } from "../../config/constants.js";

import PatientNav from "./components/PatientNav.jsx";
import PatientHome from "./components/PatientHome.jsx";
import PatientMedicines from "./components/PatientMedicines.jsx";
import PatientBrainExercise from "./components/PatientBrainExercise.jsx";
import PatientHelp from "./components/PatientHelp.jsx";

import "./PatientDashboard.css";

/* ============================================================
   PATIENT DASHBOARD

   Identity comes ENTIRELY from the device token (see
   patientDeviceAxios.js -> x-device-token -> backend
   protectPatientDevice -> req.patient). This page never asks
   for or trusts a patientId.

   One route (/patient-device) with five simple tabs:
   Home, Medicines, Brain Exercise, Family, Help.

   All data is loaded once here from the EXISTING patient-device
   APIs and passed down to the views.
============================================================ */

const PatientDashboard = () => {
  const navigate = useNavigate();
  const hasRequestedLocation = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [patientName, setPatientName] = useState("");
  const [medications, setMedications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskSummary, setTaskSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });
  const [cognitiveStatus, setCognitiveStatus] = useState(null);

  const [view, setView] = useState("home");
  const [isPlaying, setIsPlaying] = useState(false);
  const [busyKey, setBusyKey] = useState("");

  const [locationStatus, setLocationStatus] = useState("idle");
  const [lastLocationUpdateAt, setLastLocationUpdateAt] = useState(null);

  const goToPairing = () => {
    clearDeviceToken();
    navigate(ROUTES.PATIENT_DEVICE_PAIR, { replace: true });
  };

  /* ---------------- DATA LOADING ---------------- */

  const loadCognitiveStatus = async () => {
    try {
      const response = await getMyCognitiveActivityToday();
      setCognitiveStatus(response);
    } catch (error) {
      if (error.response?.status === 401) {
        goToPairing();
        return;
      }
      console.error("Unable to load cognitive status:", error);
    }
  };

  // Fetches everything. `showSpinner` is only true for the first
  // load, so later refreshes (after marking a medicine, etc.)
  // don't flash the whole screen.
  const loadDashboard = async (showSpinner = false) => {
    try {
      if (showSpinner) setIsLoading(true);
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

      await loadCognitiveStatus();
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
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasDeviceToken()) {
      navigate(ROUTES.PATIENT_DEVICE_PAIR, { replace: true });
      return;
    }

    loadDashboard(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- GPS (existing behavior, unchanged) ----------------
     Requested once per dashboard visit — never aggressively
     polled. Reports only what really happened. */

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
          setLastLocationUpdateAt(new Date());
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

  /* ---------------- ACTIONS ---------------- */

  const handleMarkTaken = async (medicationId, time) => {
    const key = `${medicationId}_${time}`;

    try {
      setBusyKey(key);
      await markMyMedicationTaken(medicationId, time);
      await loadDashboard();
    } catch (error) {
      console.error("Unable to mark medication taken:", error);
      if (error.response?.status === 401) goToPairing();
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
      if (error.response?.status === 401) goToPairing();
    } finally {
      setBusyKey("");
    }
  };

  /* ---------------- RENDER ---------------- */

  if (isLoading) {
    return (
      <div className="patient-dash patient-dash--center">
        <div className="patient-dash__spinner" />
        <p>Loading your day...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="patient-dash patient-dash--center">
        <p>{loadError}</p>
        <button
          className="patient-btn patient-btn--primary"
          onClick={() => loadDashboard(true)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`patient-dash ${isPlaying ? "patient-dash--playing" : ""}`}>
      {view === "home" && (
        <PatientHome
          patientName={patientName}
          medications={medications}
          tasks={tasks}
          taskSummary={taskSummary}
          busyKey={busyKey}
          onToggleTask={handleToggleTask}
          cognitiveStatus={cognitiveStatus}
          onNavigate={setView}
        />
      )}

      {view === "medicines" && (
        <PatientMedicines
          medications={medications}
          busyKey={busyKey}
          onMarkTaken={handleMarkTaken}
        />
      )}

      {view === "brain" && (
        <PatientBrainExercise
          cognitiveStatus={cognitiveStatus}
          onActivitySaved={loadCognitiveStatus}
          onPlayingChange={setIsPlaying}
        />
      )}

      {view === "help" && (
        <PatientHelp
          locationStatus={locationStatus}
          lastLocationUpdateAt={lastLocationUpdateAt}
        />
      )}

      {!isPlaying && <PatientNav activeView={view} onNavigate={setView} />}
    </div>
  );
};

export default PatientDashboard;
