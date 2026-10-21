import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { FaChartLine } from "react-icons/fa";

import "./ChartCard.css";

/* ============================================================
   ASSESSMENT TREND CHART

   Plots the number of AI assessments performed per day over the
   last 14 days, built from the real `createdAt` timestamp on
   each assessment already fetched via getDoctorAssessments().
   Days with zero assessments show as 0 — never omitted or
   guessed.
============================================================ */

const DAYS_TO_SHOW = 14;

const buildTrendData = (assessments) => {
  const days = [];

  for (let i = DAYS_TO_SHOW - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  const counts = days.map((date) => {
    const dayKey = date.toISOString().slice(0, 10);

    const count = assessments.filter((assessment) => {
      if (!assessment.createdAt) return false;
      return (
        new Date(assessment.createdAt).toISOString().slice(0, 10) === dayKey
      );
    }).length;

    return {
      date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      count,
    };
  });

  return counts;
};

const AssessmentTrendChart = ({ assessments = [], isLoading = false }) => {
  const data = buildTrendData(assessments);
  const hasAnyActivity = data.some((point) => point.count > 0);

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <span>LAST 14 DAYS</span>
          <h2>Assessment Activity</h2>
        </div>
        <FaChartLine className="chart-card__header-icon" />
      </div>

      {isLoading ? (
        <div className="chart-card__state">Loading chart...</div>
      ) : assessments.length === 0 ? (
        <div className="chart-card__state">
          No assessments yet — activity will appear here once AI
          assessments are completed.
        </div>
      ) : !hasAnyActivity ? (
        <div className="chart-card__state">
          No assessments in the last 14 days.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="assessmentTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f3f8" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              interval={Math.ceil(DAYS_TO_SHOW / 7)}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              name="Assessments"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#assessmentTrendFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AssessmentTrendChart;
