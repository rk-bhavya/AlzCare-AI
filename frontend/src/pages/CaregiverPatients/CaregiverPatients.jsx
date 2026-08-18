import { useEffect, useMemo, useState } from "react";

import {
  FaSearch,
  FaTimes,
  FaSyncAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaUserInjured,
  FaEye,
  FaPills,
  FaHeartbeat,
  FaGamepad,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import { getCaregiverPatients } from "../../api/caregiver.api.js";

import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const CaregiverPatients = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getCaregiverPatients();
      setPatients(response.patients || []);
    } catch (err) {
      console.error("Unable to load patients:", err);
      setError(
        err.response?.data?.message || "Unable to load your patients."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return patients;

    return patients.filter((patient) => {
      const name = patient.fullName?.toLowerCase() || "";
      const email = patient.email?.toLowerCase() || "";
      const gender = patient.gender?.toLowerCase() || "";

      return (
        name.includes(search) ||
        email.includes(search) ||
        gender.includes(search)
      );
    });
  }, [patients, searchTerm]);

  return (
    <CaregiverPageLayout
      activePage="My Patients"
      eyebrow="Patient Management"
      title="My Patients"
      subtitle="Patients currently assigned to your care."
    >
      <div className="cg-card">
        <div className="cg-card__header">
          <div>
            <span>PATIENT MANAGEMENT</span>
            <h2>My Patients</h2>
          </div>

          <button
            type="button"
            className="cg-btn cg-btn--outline cg-btn--sm"
            onClick={loadPatients}
          >
            <FaSyncAlt />
            Refresh
          </button>
        </div>

        <div className="cg-toolbar">
          <div className="cg-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")}>
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading patients...
          </div>
        ) : error ? (
          <div className="cg-state cg-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
            <button className="cg-btn cg-btn--outline cg-btn--sm" onClick={loadPatients}>
              Retry
            </button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="cg-state">
            <FaUserInjured />
            <strong>
              {searchTerm
                ? "No patients match your search."
                : "No patients are currently assigned to you."}
            </strong>
          </div>
        ) : (
          <div className="cg-table-wrapper">
            <table className="cg-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Latest AI Assessment</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td>
                      <div className="cg-name-cell">
                        <div className="cg-avatar-sm">
                          {getInitials(patient.fullName) || "P"}
                        </div>
                        <div>
                          <strong>{patient.fullName}</strong>
                          <span>{patient.gender || "Not specified"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{patient.age || "—"}</td>
                    <td>{patient.email || "—"}</td>
                    <td>{patient.phone || "—"}</td>

                    <td>
                      {patient.latestAssessment ? (
                        <span
                          className={`cg-badge ${
                            patient.latestAssessment.prediction ===
                            "Moderate Dementia"
                              ? "cg-badge--red"
                              : patient.latestAssessment.prediction ===
                                "Non Demented"
                              ? "cg-badge--green"
                              : "cg-badge--orange"
                          }`}
                        >
                          {patient.latestAssessment.prediction}
                        </span>
                      ) : (
                        <span className="cg-badge cg-badge--gray">
                          No assessment yet
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="cg-btn cg-btn--outline cg-btn--sm"
                          onClick={() =>
                            navigate(`/caregiver/patients/${patient._id}`)
                          }
                          title="View patient"
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className="cg-btn cg-btn--outline cg-btn--sm"
                          onClick={() => navigate("/caregiver/medications")}
                          title="Medications"
                        >
                          <FaPills />
                        </button>

                        <button
                          type="button"
                          className="cg-btn cg-btn--outline cg-btn--sm"
                          onClick={() => navigate("/caregiver/monitoring")}
                          title="Monitoring"
                        >
                          <FaHeartbeat />
                        </button>

                        <button
                          type="button"
                          className="cg-btn cg-btn--outline cg-btn--sm"
                          onClick={() => navigate("/caregiver/cognitive")}
                          title="Cognitive Assistance"
                        >
                          <FaGamepad />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CaregiverPageLayout>
  );
};

export default CaregiverPatients;
