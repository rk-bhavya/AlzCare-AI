import { useState } from "react";

import {
  FaBrain,
  FaHome,
  FaUserInjured,
  FaFileMedicalAlt,
  FaCalendarAlt,
  FaBell,
  FaComments,
  FaUserCog,
  FaCog,
  FaBars,
  FaFileAlt,
} from "react-icons/fa";

import "../../styles/demo-dashboard.css";

/* ============================================================
   STATIC DEMO — DOCTOR DASHBOARD

   UI-only demonstration page. All data below is static mock
   data for a project-guide demo. No API calls, no database
   calls — renders identically even with the backend offline.
============================================================ */

const NAV_ITEMS = [
  { label: "Dashboard", icon: <FaHome /> },
  { label: "Patients", icon: <FaUserInjured /> },
  { label: "AI Reports", icon: <FaFileMedicalAlt /> },
  { label: "Appointments", icon: <FaCalendarAlt /> },
  { label: "Notifications", icon: <FaBell /> },
  { label: "Messages", icon: <FaComments /> },
  { label: "Reports", icon: <FaFileAlt /> },
];

const ACCOUNT_ITEMS = [
  { label: "Profile", icon: <FaUserCog /> },
  { label: "Settings", icon: <FaCog /> },
];

const PATIENTS = [
  { name: "Ramesh Kumar", age: 72, risk: "Moderate", score: 72, status: "Monitoring" },
  { name: "Lakshmi Devi", age: 68, risk: "Low", score: 84, status: "Stable" },
  { name: "Suresh Rao", age: 75, risk: "High", score: 48, status: "Attention Required" },
  { name: "Meena Sharma", age: 70, risk: "Moderate", score: 65, status: "Monitoring" },
];

const RISK_OVERVIEW = [
  { label: "Low Risk", count: 8, max: 24, color: "#10b981" },
  { label: "Moderate Risk", count: 12, max: 24, color: "#f59e0b" },
  { label: "High Risk", count: 4, max: 24, color: "#ef4444" },
];

const COGNITIVE_ASSESSMENT = [
  { label: "Memory", value: 72 },
  { label: "Attention", value: 68 },
  { label: "Orientation", value: 78 },
];

const RECENT_ALERTS = [
  { patient: "Ramesh Kumar", detail: "Medication missed" },
  { patient: "Suresh Rao", detail: "Cognitive score decreased" },
  { patient: "Meena Sharma", detail: "Follow-up assessment due" },
];

const RECENT_REPORTS = [
  { patient: "Ramesh Kumar", type: "Cognitive Assessment", status: "Reviewed" },
  { patient: "Suresh Rao", type: "Alzheimer's Risk Assessment", status: "Pending" },
  { patient: "Meena Sharma", type: "Cognitive Screening", status: "Reviewed" },
];

const riskBadgeClass = (risk) => {
  if (risk === "Low") return "demo-badge--green";
  if (risk === "High") return "demo-badge--red";
  return "demo-badge--orange";
};

const statusBadgeClass = (status) => {
  if (status === "Stable") return "demo-badge--green";
  if (status === "Attention Required") return "demo-badge--red";
  return "demo-badge--blue";
};

const DoctorDashboardDemo = () => {
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
              <h1>Welcome back, Doctor! 👋</h1>
              <p>Here's an overview of your patients and their cognitive health.</p>
            </div>
          </div>

          <div className="demo-header__avatar">DR</div>
        </header>

        <div className="demo-content">
          {/* SUMMARY CARDS */}
          <div className="demo-summary-grid">
            <div className="demo-summary-card">
              <div className="demo-summary-card__icon demo-summary-card__icon--indigo">
                <FaUserInjured />
              </div>
              <span className="demo-summary-card__label">Total Patients</span>
              <strong className="demo-summary-card__value">24</strong>
            </div>

            <div className="demo-summary-card">
              <div className="demo-summary-card__icon demo-summary-card__icon--blue">
                <FaFileMedicalAlt />
              </div>
              <span className="demo-summary-card__label">Under Monitoring</span>
              <strong className="demo-summary-card__value">18</strong>
            </div>

            <div className="demo-summary-card">
              <div className="demo-summary-card__icon demo-summary-card__icon--red">
                <FaBell />
              </div>
              <span className="demo-summary-card__label">High Risk Patients</span>
              <strong className="demo-summary-card__value">4</strong>
            </div>

            <div className="demo-summary-card">
              <div className="demo-summary-card__icon demo-summary-card__icon--orange">
                <FaFileAlt />
              </div>
              <span className="demo-summary-card__label">Reports Pending</span>
              <strong className="demo-summary-card__value">3</strong>
            </div>
          </div>

          {/* PATIENT OVERVIEW TABLE */}
          <div className="demo-card">
            <div className="demo-card__header">
              <div>
                <span>OVERVIEW</span>
                <h2>Patient Overview</h2>
              </div>
            </div>

            <div className="demo-table-wrapper">
              <table className="demo-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Risk Level</th>
                    <th>Cognitive Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PATIENTS.map((patient) => (
                    <tr key={patient.name}>
                      <td>{patient.name}</td>
                      <td>{patient.age}</td>
                      <td>
                        <span className={`demo-badge ${riskBadgeClass(patient.risk)}`}>
                          {patient.risk}
                        </span>
                      </td>
                      <td>{patient.score}%</td>
                      <td>
                        <span className={`demo-badge ${statusBadgeClass(patient.status)}`}>
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="demo-grid-2">
            {/* RISK OVERVIEW */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>ANALYTICS</span>
                  <h2>Alzheimer's Risk Overview</h2>
                </div>
              </div>

              {RISK_OVERVIEW.map((risk) => (
                <div className="demo-risk-row" key={risk.label}>
                  <span className="demo-risk-row__label">{risk.label}</span>
                  <div className="demo-risk-row__track">
                    <div
                      className="demo-risk-row__fill"
                      style={{
                        width: `${(risk.count / risk.max) * 100}%`,
                        background: risk.color,
                      }}
                    />
                  </div>
                  <span className="demo-risk-row__count">{risk.count}</span>
                </div>
              ))}
            </div>

            {/* COGNITIVE ASSESSMENT */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>AVERAGE ACROSS PATIENTS</span>
                  <h2>Cognitive Assessment</h2>
                </div>
                <span className="demo-badge demo-badge--indigo">Overall 72%</span>
              </div>

              {COGNITIVE_ASSESSMENT.map((item) => (
                <div className="demo-progress-row" key={item.label}>
                  <div className="demo-progress-row__label">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="demo-progress-track">
                    <div
                      className="demo-progress-fill"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="demo-grid-2">
            {/* RECENT PATIENT ALERTS */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>ATTENTION</span>
                  <h2>Recent Patient Alerts</h2>
                </div>
              </div>

              {RECENT_ALERTS.map((alert) => (
                <div className="demo-list-item" key={alert.patient + alert.detail}>
                  <div>
                    <div className="demo-list-item__title">{alert.patient}</div>
                    <div className="demo-list-item__meta">{alert.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* RECENT REPORTS */}
            <div className="demo-card">
              <div className="demo-card__header">
                <div>
                  <span>DOCUMENTATION</span>
                  <h2>Recent Reports</h2>
                </div>
              </div>

              {RECENT_REPORTS.map((report) => (
                <div className="demo-list-item" key={report.patient + report.type}>
                  <div>
                    <div className="demo-list-item__title">{report.patient}</div>
                    <div className="demo-list-item__meta">{report.type}</div>
                  </div>
                  <span
                    className={`demo-badge ${
                      report.status === "Reviewed"
                        ? "demo-badge--green"
                        : "demo-badge--orange"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboardDemo;
