import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaLock,
  FaSignOutAlt,
  FaCheckCircle,
  FaEnvelope,
  FaMobileAlt,
} from "react-icons/fa";

import { STORAGE_KEYS, ROUTES } from "../../config/constants.js";
import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const SETTINGS_KEY = "nc_caregiver_settings";

const defaultSettings = {
  emailAlerts: true,
  medicationReminders: true,
  appointmentReminders: true,
  smsAlerts: false,
};

const CaregiverSettings = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(defaultSettings);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (err) {
        console.error("Unable to parse saved settings:", err);
      }
    }
  }, []);

  const toggleSetting = (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSavedMessage("Preferences saved.");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate(ROUTES.CAREGIVER_LOGIN, { replace: true });
  };

  const toggles = [
    {
      key: "emailAlerts",
      icon: <FaEnvelope />,
      label: "Email Alerts",
      description: "Receive alert emails for critical patient notifications.",
    },
    {
      key: "medicationReminders",
      icon: <FaBell />,
      label: "Medication Reminders",
      description: "Get reminded when a medication dose is due or missed.",
    },
    {
      key: "appointmentReminders",
      icon: <FaBell />,
      label: "Appointment Reminders",
      description: "Get reminded ahead of upcoming appointments.",
    },
    {
      key: "smsAlerts",
      icon: <FaMobileAlt />,
      label: "SMS Alerts",
      description: "Receive urgent alerts via text message.",
    },
  ];

  return (
    <CaregiverPageLayout
      activePage="Settings"
      eyebrow="Account"
      title="Caregiver Settings"
      subtitle="Manage notification preferences and account security."
    >
      <div className="cg-card">
        <div className="cg-card__header">
          <div>
            <span>PREFERENCES</span>
            <h2>Notification Preferences</h2>
          </div>
          {savedMessage && (
            <span style={{ fontSize: 13, color: "#15803d", display: "flex", alignItems: "center", gap: 6 }}>
              <FaCheckCircle /> {savedMessage}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {toggles.map((toggle) => (
            <div
              key={toggle.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 12,
                border: "1px solid #eef1f6",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#eef2ff",
                  color: "#4338ca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {toggle.icon}
              </div>

              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14, display: "block" }}>
                  {toggle.label}
                </strong>
                <span style={{ fontSize: 13, color: "#8b96ab" }}>
                  {toggle.description}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleSetting(toggle.key)}
                aria-label={`Toggle ${toggle.label}`}
                style={{
                  width: 46,
                  height: 26,
                  borderRadius: 999,
                  border: "none",
                  background: settings[toggle.key] ? "#14b8a6" : "#dbe1eb",
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.15s ease",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: settings[toggle.key] ? 23 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.15s ease",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="cg-card">
        <div className="cg-card__header">
          <div>
            <span>SECURITY</span>
            <h2>Account Security</h2>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid #eef1f6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#eef2ff",
                color: "#4338ca",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaLock />
            </div>
            <div>
              <strong style={{ fontSize: 14, display: "block" }}>
                Password
              </strong>
              <span style={{ fontSize: 13, color: "#8b96ab" }}>
                Change your account password.
              </span>
            </div>
          </div>

          <button
            type="button"
            className="cg-btn cg-btn--outline cg-btn--sm"
            onClick={() => navigate("/forgot-password")}
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="cg-card">
        <div className="cg-card__header">
          <div>
            <span>SESSION</span>
            <h2>Logout</h2>
          </div>
        </div>

        <p style={{ fontSize: 14, color: "#6b7690", marginBottom: 16 }}>
          You'll be signed out of your caregiver account on this device.
        </p>

        <button
          type="button"
          className="cg-btn cg-btn--danger"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </CaregiverPageLayout>
  );
};

export default CaregiverSettings;
