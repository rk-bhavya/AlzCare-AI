import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { FaChartPie } from "react-icons/fa";

import "./ChartCard.css";

/* ============================================================
   RISK DISTRIBUTION CHART

   Shows how many of the doctor's AI assessments fall into each
   prediction category. Built entirely from the `assessments`
   array already fetched via getDoctorAssessments() — no values
   are invented. Each assessment counts once, by its own
   `prediction` field.
============================================================ */

const PREDICTION_COLORS = {
  "Non Demented": "#16a34a",
  "Very Mild Dementia": "#0ea5e9",
  "Mild Dementia": "#f59e0b",
  "Moderate Dementia": "#dc2626",
};

const PREDICTION_ORDER = [
  "Non Demented",
  "Very Mild Dementia",
  "Mild Dementia",
  "Moderate Dementia",
];

const RiskDistributionChart = ({ assessments = [], isLoading = false }) => {
  const counts = PREDICTION_ORDER.reduce((acc, label) => {
    acc[label] = 0;
    return acc;
  }, {});

  assessments.forEach((assessment) => {
    if (assessment.prediction && counts[assessment.prediction] !== undefined) {
      counts[assessment.prediction] += 1;
    }
  });

  const data = PREDICTION_ORDER.map((label) => ({
    name: label,
    value: counts[label],
  })).filter((entry) => entry.value > 0);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <span>ANALYTICS</span>
          <h2>Patient Risk Distribution</h2>
        </div>
        <FaChartPie className="chart-card__header-icon" />
      </div>

      {isLoading ? (
        <div className="chart-card__state">Loading chart...</div>
      ) : assessments.length === 0 ? (
        <div className="chart-card__state">
          No assessments yet — this chart will populate once AI
          assessments are completed.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={PREDICTION_COLORS[entry.name] || "#94a3b8"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              wrapperStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RiskDistributionChart;
