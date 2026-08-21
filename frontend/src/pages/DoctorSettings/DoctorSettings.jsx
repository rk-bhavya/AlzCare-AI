import { useEffect, useState } from "react";

import {
  FaBell,
  FaLock,
  FaUserCog,
  FaSave,
  FaUndo,
} from "react-icons/fa";

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";

import { useNavigate } from "react-router-dom";

import "./DoctorSettings.css";


const DoctorSettings = () => {

  /* ============================================================
     SETTINGS STATE
  ============================================================ */

  const defaultSettings = {
    appointmentNotifications: true,
    aiAssessmentNotifications: true,
    patientSafetyAlerts: true,
    caregiverMessages: true,
    emailNotifications: false,
    compactDashboard: false,
  };


  const [settings, setSettings] =
    useState(defaultSettings);

  const [saved, setSaved] =
    useState(false);

    const navigate = useNavigate();
  /* ============================================================
     LOAD SAVED SETTINGS
  ============================================================ */

  useEffect(() => {

    const storedSettings =
      localStorage.getItem(
        "doctor_settings"
      );

    if (storedSettings) {

      try {

        const parsedSettings =
          JSON.parse(storedSettings);

        setSettings({
          ...defaultSettings,
          ...parsedSettings,
        });

      } catch (error) {

        console.error(
          "Unable to load doctor settings:",
          error
        );

      }

    }

  }, []);


  /* ============================================================
     HANDLE TOGGLE
  ============================================================ */

  const handleToggle = (name) => {

    setSettings(
      (previous) => ({
        ...previous,
        [name]:
          !previous[name],
      })
    );

    setSaved(false);

  };


  /* ============================================================
     SAVE SETTINGS
  ============================================================ */

  const handleSave = () => {

    localStorage.setItem(
      "doctor_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);

  };


  /* ============================================================
     RESET SETTINGS
  ============================================================ */

  const handleReset = () => {

    setSettings(
      defaultSettings
    );

    localStorage.setItem(
      "doctor_settings",
      JSON.stringify(
        defaultSettings
      )
    );

    setSaved(false);

  };


  return (
    <div className="doctor-dashboard">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <DoctorSidebar
        activePage="Settings"
      />


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content doctor-settings">


          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="doctor-settings__header">

            <div>

              <span>
                ACCOUNT
              </span>

              <h1>
                Settings
              </h1>

              <p>
                Manage your dashboard and notification
                preferences.
              </p>

            </div>


            {saved && (

              <div className="doctor-settings__saved">

                <FaSave />

                Settings saved successfully

              </div>

            )}

          </section>


          {/* ==================================================
              NOTIFICATION SETTINGS
          ================================================== */}

          <section className="doctor-dashboard__card doctor-settings__card">

            <div className="doctor-settings__card-header">

              <div className="doctor-settings__card-icon">

                <FaBell />

              </div>

              <div>

                <h2>
                  Notification Preferences
                </h2>

                <p>
                  Choose which patient updates you
                  want to receive.
                </p>

              </div>

            </div>


            <div className="doctor-settings__options">


              <SettingToggle
                title="Appointment Notifications"
                description="Receive updates about upcoming and changed appointments."
                checked={
                  settings.appointmentNotifications
                }
                onChange={() =>
                  handleToggle(
                    "appointmentNotifications"
                  )
                }
              />


              <SettingToggle
                title="AI Assessment Notifications"
                description="Get notified when a new AI assessment is available."
                checked={
                  settings.aiAssessmentNotifications
                }
                onChange={() =>
                  handleToggle(
                    "aiAssessmentNotifications"
                  )
                }
              />


              <SettingToggle
                title="Patient Safety Alerts"
                description="Receive important alerts related to patient safety."
                checked={
                  settings.patientSafetyAlerts
                }
                onChange={() =>
                  handleToggle(
                    "patientSafetyAlerts"
                  )
                }
              />


              <SettingToggle
                title="Caregiver Messages"
                description="Receive notifications when caregivers send you messages."
                checked={
                  settings.caregiverMessages
                }
                onChange={() =>
                  handleToggle(
                    "caregiverMessages"
                  )
                }
              />


              <SettingToggle
                title="Email Notifications"
                description="Receive selected system notifications through email."
                checked={
                  settings.emailNotifications
                }
                onChange={() =>
                  handleToggle(
                    "emailNotifications"
                  )
                }
              />

            </div>

          </section>


          {/* ==================================================
              DASHBOARD SETTINGS
          ================================================== */}

          <section className="doctor-dashboard__card doctor-settings__card">

            <div className="doctor-settings__card-header">

              <div className="doctor-settings__card-icon">

                <FaUserCog />

              </div>

              <div>

                <h2>
                  Dashboard Preferences
                </h2>

                <p>
                  Customize how information is displayed
                  on your dashboard.
                </p>

              </div>

            </div>


            <div className="doctor-settings__options">

              <SettingToggle
                title="Compact Dashboard"
                description="Use a more compact layout for dashboard information."
                checked={
                  settings.compactDashboard
                }
                onChange={() =>
                  handleToggle(
                    "compactDashboard"
                  )
                }
              />

            </div>

          </section>


          {/* ==================================================
              SECURITY
          ================================================== */}

          <section className="doctor-dashboard__card doctor-settings__card">

            <div className="doctor-settings__card-header">

              <div className="doctor-settings__card-icon">

                <FaLock />

              </div>

              <div>

                <h2>
                  Security
                </h2>

                <p>
                  Keep your doctor account secure.
                </p>

              </div>

            </div>


            <div className="doctor-settings__security">

              <div>

                <strong>
                  Password
                </strong>

                <span>
                  Your account password is protected.
                </span>

              </div>


              <button
  type="button"
  className="doctor-settings__secondary-button"
  onClick={() =>
    navigate("/forgot-password")
  }
>
  Change Password
</button>

            </div>

          </section>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="doctor-settings__actions">

            <button
              type="button"
              className="doctor-settings__reset"
              onClick={handleReset}
            >

              <FaUndo />

              Reset

            </button>


            <button
              type="button"
              className="doctor-settings__save"
              onClick={handleSave}
            >

              <FaSave />

              Save Changes

            </button>

          </div>


        </div>

      </main>

    </div>
  );
};


/* ============================================================
   TOGGLE COMPONENT
============================================================ */

const SettingToggle = ({
  title,
  description,
  checked,
  onChange,
}) => {

  return (
    <div className="doctor-setting-row">

      <div className="doctor-setting-row__content">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`doctor-setting-toggle ${
          checked
            ? "doctor-setting-toggle--active"
            : ""
        }`}
        onClick={onChange}
      >

        <span />

      </button>

    </div>
  );
};


export default DoctorSettings;