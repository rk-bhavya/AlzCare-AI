import { useEffect, useState } from "react";

import { formatTime12h } from "../patientDashboardUtils.js";

/* ============================================================
   PATIENT HOME

   Welcome section + a full, functional Today's Tasks list
   (there is no separate "Tasks" nav tab, so the complete task
   checklist lives here) + quick-glance cards for Medicines and
   Brain Exercise that jump to their full dedicated tabs.

   All data (name, medications, tasks, cognitive status) is
   passed down from PatientDashboard.jsx, which already loaded
   it from the existing patient-device APIs — nothing here is
   fetched or fabricated independently.
============================================================ */

const POSITIVE_MESSAGES = [
  "You're doing great today!",
  "One step at a time — you've got this!",
  "Today is a good day to feel proud of yourself.",
  "Take it easy, enjoy your day.",
];

const PatientHome = ({
  patientName,
  medications,
  tasks,
  taskSummary,
  busyKey,
  onToggleTask,
  cognitiveStatus,
  onNavigate,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const firstName = patientName.split(" ")[0] || "there";

  // A fixed, friendly message for the day (not derived from any
  // health data — purely a cheerful greeting, never a medical claim).
  const positiveMessage = POSITIVE_MESSAGES[now.getDate() % POSITIVE_MESSAGES.length];

  const dateLabel = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const timeLabel = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const pendingMedsCount = medications.filter((m) => m.status !== "taken").length;

  return (
    <div>
      {/* WELCOME */}
      <h1 className="patient-dash__greeting">
        Hello, {firstName} <span>❤️</span>
      </h1>
      <p className="patient-dash__datetime">
        {dateLabel} · {timeLabel}
      </p>
      <p className="patient-dash__subtitle">{positiveMessage}</p>

      {/* QUICK GLANCE: MEDICINES */}
      <button
        type="button"
        className="patient-card patient-card--link"
        onClick={() => onNavigate("medicines")}
      >
        <div className="patient-card__icon">💊</div>
        <h3>Medicines</h3>
        <p>
          {medications.length === 0
            ? "Nothing scheduled today."
            : pendingMedsCount === 0
            ? "All of today's medicines are taken. Well done!"
            : `${pendingMedsCount} medicine${
                pendingMedsCount === 1 ? "" : "s"
              } still to take today.`}
        </p>
        <span className="patient-card__link-arrow">View Medicines →</span>
      </button>

      {/* QUICK GLANCE: BRAIN EXERCISE */}
      <button
        type="button"
        className="patient-card patient-card--link"
        onClick={() => onNavigate("brain")}
      >
        <div className="patient-card__icon">🧠</div>
        <h3>Brain Exercise</h3>
        <p>
          {cognitiveStatus?.completedToday
            ? "You've completed an activity today. Great work!"
            : "You haven't done today's brain exercise yet."}
        </p>
        <span className="patient-card__link-arrow">Go to Brain Exercise →</span>
      </button>

      {/* TODAY'S TASKS — full, functional, lives only on Home */}
      <div className="patient-card">
        <div className="patient-card__icon">📋</div>
        <h3>Today's Tasks</h3>

        {taskSummary.total === 0 ? (
          <p>No tasks set for today.</p>
        ) : (
          <>
            <p className="patient-task-summary">
              {taskSummary.completed} of {taskSummary.total} completed
            </p>

            <div className="patient-progress-track">
              <div
                className="patient-progress-fill"
                style={{
                  width: `${
                    taskSummary.total > 0
                      ? (taskSummary.completed / taskSummary.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="patient-task-list">
              {tasks.map((task) => (
                <button
                  key={task._id}
                  className={`patient-task-item ${
                    task.isCompleted ? "patient-task-item--done" : ""
                  }`}
                  onClick={() => onToggleTask(task)}
                  disabled={busyKey === task._id}
                >
                  <span className="patient-task-checkbox">
                    {task.isCompleted ? "☑" : "☐"}
                  </span>
                  <span className="patient-task-item__body">
                    <strong>{task.title}</strong>
                    <span className="patient-task-item__meta">
                      {task.category}
                      {task.scheduledTime
                        ? ` · ${formatTime12h(task.scheduledTime)}`
                        : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientHome;
