import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { FaChartBar } from "react-icons/fa";

import "./ChartCard.css";

/* ============================================================
   PATIENT AGE DISTRIBUTION CHART

   Groups the doctor's real patients (from /doctor/patients) into
   age buckets using each patient's own `age` field. Patients
   without an age on record are excluded from the chart rather
   than guessed, and are called out explicitly below the chart.
============================================================ */

const AGE_BUCKETS = [
  { label: "Under 50", min: 0, max: 49 },
  { label: "50–59", min: 50, max: 59 },
  { label: "60–69", min: 60, max: 69 },
  { label: "70–79", min: 70, max: 79 },
  { label: "80+", min: 80, max: Infinity },
];

const BAR_COLOR = "#0ea5e9";

const PatientAgeChart = ({ patients = [], isLoading = false }) => {
  const patientsWithAge = patients.filter(
    (patient) => typeof patient.age === "number" && !Number.isNaN(patient.age)
  );

  const data = AGE_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: patientsWithAge.filter(
      (patient) => patient.age >= bucket.min && patient.age <= bucket.max
    ).length,
  }));

  const missingAgeCount = patients.length - patientsWithAge.length;

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <span>DEMOGRAPHICS</span>
          <h2>Patient Age Distribution</h2>
        </div>
        <FaChartBar className="chart-card__header-icon" />
      </div>

      {isLoading ? (
        <div className="chart-card__state">Loading chart...</div>
      ) : patientsWithAge.length === 0 ? (
        <div className="chart-card__state">
          No age data is available for your patients yet.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f3f8" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip />
              <Bar dataKey="count" name="Patients" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.label} fill={BAR_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {missingAgeCount > 0 && (
            <p className="chart-card__footnote">
              {missingAgeCount} patient{missingAgeCount === 1 ? "" : "s"}{" "}
              without an age on record {missingAgeCount === 1 ? "is" : "are"}{" "}
              not included above.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default PatientAgeChart;
