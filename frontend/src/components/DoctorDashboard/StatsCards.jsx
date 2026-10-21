import {
  FaUserInjured,
  FaUserCheck,
  FaBrain,
  FaExclamationTriangle,
} from "react-icons/fa";

import "./StatsCards.css";

/* ============================================================
   STATS CARDS

   Four KPI cards for the Doctor Dashboard. Every value passed
   in is derived from real data already loaded by the dashboard
   (patients list, assessment count, attention count) — nothing
   here is fabricated. Loading states show "..." rather than a
   guessed number.
============================================================ */

const StatsCards = ({
  totalPatients,
  isLoadingPatients,
  activePatients,
  assessmentsCompleted,
  isLoadingAssessments,
  patientsNeedingAttention,
  isLoadingAttention,
}) => {
  const cards = [
    {
      key: "total",
      label: "Total Patients",
      value: isLoadingPatients ? "..." : totalPatients,
      meta: "Patients currently assigned",
      icon: <FaUserInjured />,
      accent: "indigo",
    },
    {
      key: "active",
      label: "Active Patients",
      value: isLoadingPatients ? "..." : activePatients,
      meta: "With an active care assignment",
      icon: <FaUserCheck />,
      accent: "teal",
    },
    {
      key: "assessments",
      label: "Assessments Completed",
      value: isLoadingAssessments ? "..." : assessmentsCompleted,
      meta: "AI-assisted assessments on record",
      icon: <FaBrain />,
      accent: "blue",
    },
    {
      key: "attention",
      label: "Requiring Attention",
      value: isLoadingAttention ? "..." : patientsNeedingAttention,
      meta: "Patients flagged for review",
      icon: <FaExclamationTriangle />,
      accent: "amber",
    },
  ];

  return (
    <section className="stats-cards">
      {cards.map((card) => (
        <div
          className={`stats-card stats-card--${card.accent}`}
          key={card.key}
        >
          <div className="stats-card__icon">{card.icon}</div>

          <div className="stats-card__body">
            <span className="stats-card__label">{card.label}</span>
            <strong className="stats-card__value">{card.value}</strong>
            <span className="stats-card__meta">{card.meta}</span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default StatsCards;
