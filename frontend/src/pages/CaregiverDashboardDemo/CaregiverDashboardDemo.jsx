import { useState } from "react";

import {
  FaBrain,
  FaHome,
  FaUserInjured,
  FaPills,
  FaClipboardList,
  FaGamepad,
  FaBell,
  FaUsers,
  FaMobileAlt,
  FaFileAlt,
  FaUserCog,
  FaCog,
  FaBars,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

import "../../styles/demo-dashboard.css";

/* ============================================================
   STATIC DEMO — CAREGIVER DASHBOARD

   UI-only demonstration page. All data below is static mock
   data for a project-guide demo. No API calls, no database
   calls — renders identically even with the backend offline.
============================================================ */

const NAV_ITEMS = [
  { label: "Dashboard", icon: <FaHome /> },
  { label: "Patients", icon: <FaUserInjured /> },
  { label: "Medications", icon: <FaPills /> },
  { label: "Daily Tasks", icon: <FaClipboardList /> },
  { label: "Cognitive Activities", icon: <FaGamepad /> },
  { label: "Alerts & Notifications", icon: <FaBell /> },
  { label: "Family Members", icon: <FaUsers /> },
  { label: "Patient Device", icon: <FaMobileAlt /> },
  { label: "Reports", icon: <FaFileAlt /> },
];

const ACCOUNT_ITEMS = [
  { label: "Profile", icon: <FaUserCog /> },
  { label: "Settings", icon: <FaCog /> },
];

const MEDICATIONS = [
  { name: "Donepezil 10 mg", time: "08:00 AM", status: "Taken" },
  { name: "Memantine 5 mg", time: "12:00 PM", status: "Pending" },
  { name: "Vitamin B12", time: "06:00 PM", status: "Pending" },
  { name: "Melatonin 3 mg", time: "08:00 PM", status: "Pending" },
];

const DAILY_TASKS = [
  { title: "Morning Walk", status: "Completed" },
  { title: "Drink Water", status: "Completed" },
  { title: "Reading Time", status: "Pending" },
  { title: "Meditation", status: "Pending" },
  { title: "Healthy Meal", status: "Completed" },
  { title: "Take Medications", status: "Pending" },
  { title: "Brain Exercise", status: "Completed" },
  { title: "Sleep on Time", status: "Pending" },
];

const RECENT_ALERTS = [
  {
    title: "Medication missed",
    detail: "Memantine 5 mg",
    time: "12:30 PM",
    severity: "red",
  },
  {
    title: "Unfamiliar face detected",
    detail: "Front Door Camera",
    time: "10:15 AM",
    severity: "orange",
  },
  {
    title: "Help requested by patient",
    detail: "Living Room",
    time: "09:20 AM",
    severity: "red",
  },
];

const FAMILY_MEMBERS = [
  { name: "Priya Sharma", relation: "Daughter" },
  { name: "Amit Sharma", relation: "Son" },
  { name: "Neha Sharma", relation: "Daughter-in-law" },
];

const CaregiverDashboardDemo = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="demo-shell">
      {sidebarOpen && (
        <div
          className="demo-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`demo-sidebar ${sidebarOpen ? "demo-sidebar--open" : ""}`}>
        <div className="demo-sidebar__brand">
          <div className="demo-sidebar__brand-icon">
            <FaBrain />
          </div>
          <span>AlzCare AI</span>
        </div>

        {NAV_ITEMS.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={`demo-nav-item ${index === 0 ? "demo-nav-item--active" : ""}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="demo-sidebar__section-label">Account</div>

        {ACCOUNT_ITEMS.map((item) => (
          <button key={item.label} type="button" className="demo-nav-item">
            {item.icon}
            {item.label}
          </button>
        ))}
      </aside>

      <main className="demo-main">
        <header className="demo-header">
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              type="button"
              className="demo-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FaBars />
            </button>

            <div>
              <h1>Welcome back, Caregiver! 👋</h1>
              <p>Here's what's happening with your patient today.</p>
            </div>
          </div>

          <div className="demo-header__avatar">RS</div>
        </header>

        <div className="demo-content">
          {/* SUMMARY CARDS */}
          <div className="demo-summary-grid">
            <div className="demo-summary-card">
              <div className="demo-summary-card__icon demo-summary-card__icon--indigo">
                <FaUserInjured />
              </div>
              <span className="demo-summary-card__label">Patient</span>
              <strong className="demo-summary-card__value">Ramesh Kumar</strong>
              <span className="demo-summary-card__meta">Age: 72 | Male</span>
            </div>

            <div className="demo-summary-card">
              <div className="demo-summary-card__icon demo-summary-card__icon--blue">
                <FaClipboardList />
              </div>
              <span className="demo-summary-card__label">Care Plan Since</span>
              <strong className="demo-summary-card__value">12 Jan 2024</strong>
              <span className="demo-summary-card__meta">133 Days</span>
            </div>

            <div className="demo-summary-card">
              <div className="demo-summary-card__icon demo-summary-card__icon--green">
                <FaClipboardList />
              </div>
              <span className="demo-summary-card__label">Tasks Completed</span>
              <strong className="demo-summary-card__value">6 / 8</strong>
              <span className="demo-summary-card__meta">Today</span>
            </div>

            <div className="demo-summary-card">
              <div className="demo-summary-card__icon demo-summary-card__icon--red">
                <FaBell />
              </div>
              <span className="demo-summary-card__label">Active Alerts</span>
              <strong className="demo-summary-card__value">2</strong>
              <span className="demo-summary-card__meta">Requires Attention</span>
            </div>
          </div>

          <div className="demo-grid-2">
            {/* TODAY'S MEDICATIONS */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>TODAY</span>
                  <h2>Today's Medications</h2>
                </div>
              </div>

              {MEDICATIONS.map((med) => (
                <div className="demo-list-item" key={med.name}>
                  <div>
                    <div className="demo-list-item__title">{med.name}</div>
                    <div className="demo-list-item__meta">{med.time}</div>
                  </div>
                  <span
                    className={`demo-badge ${
                      med.status === "Taken"
                        ? "demo-badge--green"
                        : "demo-badge--orange"
                    }`}
                  >
                    {med.status}
                  </span>
                </div>
              ))}
            </div>

            {/* DAILY TASKS */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>CHECKLIST</span>
                  <h2>Daily Tasks</h2>
                </div>
              </div>

              <div className="demo-checklist">
                {DAILY_TASKS.map((task) => (
                  <div
                    className={`demo-checklist-item ${
                      task.status === "Completed"
                        ? "demo-checklist-item--done"
                        : ""
                    }`}
                    key={task.title}
                  >
                    <span className="demo-checklist-item__box">
                      {task.status === "Completed" ? "☑" : "☐"}
                    </span>
                    <span>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="demo-grid-2">
            {/* PATIENT INFORMATION */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>PROFILE</span>
                  <h2>Patient Information</h2>
                </div>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                Ramesh Kumar
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
                <div><span style={{ color: "#8b96ab" }}>Age:</span> 72</div>
                <div><span style={{ color: "#8b96ab" }}>Gender:</span> Male</div>
                <div><span style={{ color: "#8b96ab" }}>Blood Group:</span> O+</div>
                <div><span style={{ color: "#8b96ab" }}>Phone:</span> +91 98765 43210</div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ color: "#8b96ab" }}>Address:</span> Bengaluru, Karnataka
                </div>
              </div>
            </div>

            {/* COGNITIVE ACTIVITY */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>PROGRESS</span>
                  <h2>Cognitive Activity</h2>
                </div>
                <span className="demo-badge demo-badge--indigo">Overall 72%</span>
              </div>

              <div className="demo-progress-row">
                <div className="demo-progress-row__label">
                  <span>Memory Recall</span>
                  <span>72%</span>
                </div>
                <div className="demo-progress-track">
                  <div className="demo-progress-fill" style={{ width: "72%" }} />
                </div>
              </div>

              <div className="demo-progress-row">
                <div className="demo-progress-row__label">
                  <span>Attention Span</span>
                  <span>68%</span>
                </div>
                <div className="demo-progress-track">
                  <div className="demo-progress-fill" style={{ width: "68%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="demo-grid-2">
            {/* RECENT ALERTS */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>ATTENTION</span>
                  <h2>Recent Alerts</h2>
                </div>
              </div>

              {RECENT_ALERTS.map((alert) => (
                <div className="demo-list-item" key={alert.title + alert.time}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <FaExclamationTriangle
                      style={{
                        color: alert.severity === "red" ? "#dc2626" : "#d97706",
                        marginTop: 3,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div className="demo-list-item__title">{alert.title}</div>
                      <div className="demo-list-item__meta">{alert.detail}</div>
                    </div>
                  </div>
                  <span className="demo-badge demo-badge--gray">{alert.time}</span>
                </div>
              ))}
            </div>

            {/* FAMILY MEMBERS */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>CONTACTS</span>
                  <h2>Family Members</h2>
                </div>
              </div>

              {FAMILY_MEMBERS.map((member) => (
                <div className="demo-list-item" key={member.name}>
                  <div>
                    <div className="demo-list-item__title">{member.name}</div>
                    <div className="demo-list-item__meta">{member.relation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaregiverDashboardDemo;
