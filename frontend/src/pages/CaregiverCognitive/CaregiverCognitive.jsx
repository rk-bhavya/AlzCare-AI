import { useEffect, useState } from "react";

import {
  FaGamepad,
  FaSpinner,
  FaExclamationTriangle,
  FaBrain,
  FaHashtag,
  FaThLarge,
  FaFont,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaHistory,
} from "react-icons/fa";

import { getCaregiverPatients } from "../../api/caregiver.api.js";
import {
  createCognitiveActivity,
  getCognitiveHistory,
} from "../../api/cognitive.api.js";

import CaregiverPageLayout from "../../components/CaregiverDashboard/CaregiverPageLayout.jsx";

import MemoryGame from "./games/MemoryGame.jsx";
import NumberRecallGame from "./games/NumberRecallGame.jsx";
import PatternRecognitionGame from "./games/PatternRecognitionGame.jsx";
import WordRecallGame from "./games/WordRecallGame.jsx";

const ACTIVITIES = [
  {
    key: "memory-game",
    label: "Memory Game",
    icon: <FaBrain />,
    description: "Match pairs of cards to exercise short-term memory.",
  },
  {
    key: "number-recall",
    label: "Number Recall",
    icon: <FaHashtag />,
    description: "Remember and repeat a growing sequence of numbers.",
  },
  {
    key: "pattern-recognition",
    label: "Pattern Recognition",
    icon: <FaThLarge />,
    description: "Watch a pattern of tiles light up, then repeat it.",
  },
  {
    key: "word-recall",
    label: "Word Recall",
    icon: <FaFont />,
    description: "Memorize a short word list, then recall which were shown.",
  },
];

const CaregiverCognitive = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [error, setError] = useState("");

  const [activeGame, setActiveGame] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadPatients = async () => {
    try {
      setIsLoadingPatients(true);
      const response = await getCaregiverPatients();
      const list = response.patients || [];
      setPatients(list);

      if (list.length > 0) {
        setSelectedPatientId((prev) => prev || list[0]._id);
      }
    } catch (err) {
      console.error("Unable to load patients:", err);
      setError(err.response?.data?.message || "Unable to load patients.");
    } finally {
      setIsLoadingPatients(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const loadHistory = async () => {
    if (!selectedPatientId) return;

    try {
      const response = await getCognitiveHistory(selectedPatientId);
      setHistory(response.activities || []);
      setSummary(response.summary || []);
      setShowHistory(true);
    } catch (err) {
      console.error("Unable to load activity history:", err);
    }
  };

  const handleGameComplete = async ({ score, durationSeconds }) => {
    setLastResult({ score, durationSeconds });

    try {
      setIsSaving(true);

      await createCognitiveActivity({
        patientId: selectedPatientId,
        activityType: activeGame,
        score,
        durationSeconds,
      });

      if (showHistory) {
        await loadHistory();
      }
    } catch (err) {
      console.error("Unable to save activity result:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetGame = () => {
    setActiveGame(null);
    setLastResult(null);
  };

  const selectedPatient = patients.find((p) => p._id === selectedPatientId);

  return (
    <CaregiverPageLayout
      activePage="Cognitive Assistance"
      eyebrow="Engagement"
      title="Cognitive Assistance"
      subtitle="Fun, informal activities to help keep your patient engaged. These are not a medical diagnosis."
    >
      {isLoadingPatients ? (
        <div className="cg-card">
          <div className="cg-state">
            <FaSpinner className="appointment-spinner" />
            Loading patients...
          </div>
        </div>
      ) : error ? (
        <div className="cg-card">
          <div className="cg-state cg-state--error">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        </div>
      ) : patients.length === 0 ? (
        <div className="cg-card">
          <div className="cg-state">
            <FaGamepad />
            <strong>No patients assigned</strong>
            <span>
              Cognitive activities will be available once a patient is
              assigned to you.
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="cg-card">
            <div className="cg-toolbar" style={{ marginBottom: 0 }}>
              <div className="cg-field" style={{ minWidth: 240 }}>
                <label>Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    resetGame();
                    setShowHistory(false);
                  }}
                >
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }} />

              <button
                type="button"
                className="cg-btn cg-btn--outline cg-btn--sm"
                onClick={loadHistory}
              >
                <FaHistory />
                View Progress
              </button>
            </div>
          </div>

          {!activeGame ? (
            <div className="cg-card">
              <div className="cg-card__header">
                <div>
                  <span>ACTIVITIES</span>
                  <h2>Choose an Activity</h2>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                {ACTIVITIES.map((activity) => (
                  <button
                    key={activity.key}
                    type="button"
                    onClick={() => {
                      setActiveGame(activity.key);
                      setLastResult(null);
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      textAlign: "left",
                      padding: 18,
                      borderRadius: 14,
                      border: "1px solid #e8edf4",
                      background: "#fafcff",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "#e0f7f4",
                        color: "#0f9e8e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      {activity.icon}
                    </div>
                    <strong style={{ fontSize: 15 }}>{activity.label}</strong>
                    <span style={{ fontSize: 13, color: "#6b7690" }}>
                      {activity.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="cg-card">
              <div className="cg-card__header">
                <div>
                  <span>PLAYING FOR {selectedPatient?.fullName?.toUpperCase()}</span>
                  <h2>
                    {ACTIVITIES.find((a) => a.key === activeGame)?.label}
                  </h2>
                </div>

                <button
                  type="button"
                  className="cg-btn cg-btn--ghost cg-btn--sm"
                  onClick={resetGame}
                >
                  Back to Activities
                </button>
              </div>

              {lastResult ? (
                <div className="cg-state">
                  {lastResult.score >= 60 ? (
                    <FaCheckCircle style={{ color: "#15803d" }} />
                  ) : (
                    <FaTimesCircle style={{ color: "#b45309" }} />
                  )}
                  <strong>Activity Complete!</strong>
                  <span>
                    Score: {lastResult.score}/100
                    {lastResult.durationSeconds
                      ? ` · ${lastResult.durationSeconds}s`
                      : ""}
                  </span>
                  {isSaving && <span>Saving result...</span>}
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button
                      type="button"
                      className="cg-btn cg-btn--primary cg-btn--sm"
                      onClick={() => setLastResult(null)}
                    >
                      <FaRedo />
                      Play Again
                    </button>
                    <button
                      type="button"
                      className="cg-btn cg-btn--outline cg-btn--sm"
                      onClick={resetGame}
                    >
                      Choose Another Activity
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {activeGame === "memory-game" && (
                    <MemoryGame onComplete={handleGameComplete} />
                  )}
                  {activeGame === "number-recall" && (
                    <NumberRecallGame onComplete={handleGameComplete} />
                  )}
                  {activeGame === "pattern-recognition" && (
                    <PatternRecognitionGame onComplete={handleGameComplete} />
                  )}
                  {activeGame === "word-recall" && (
                    <WordRecallGame onComplete={handleGameComplete} />
                  )}
                </>
              )}
            </div>
          )}

          {showHistory && (
            <div className="cg-card">
              <div className="cg-card__header">
                <div>
                  <span>PROGRESS</span>
                  <h2>Activity History</h2>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {summary.map((item) => {
                  const activity = ACTIVITIES.find(
                    (a) => a.key === item.activityType
                  );
                  return (
                    <div
                      key={item.activityType}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        border: "1px solid #eef1f6",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#8b96ab" }}>
                        {activity?.label}
                      </span>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {item.averageScore !== null
                          ? `${item.averageScore}%`
                          : "—"}
                      </div>
                      <small style={{ fontSize: 12, color: "#8b96ab" }}>
                        {item.attempts} attempt{item.attempts === 1 ? "" : "s"}
                      </small>
                    </div>
                  );
                })}
              </div>

              {history.length === 0 ? (
                <div className="cg-state">
                  <strong>No activities completed yet</strong>
                </div>
              ) : (
                <div className="cg-table-wrapper">
                  <table className="cg-table">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Score</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry) => (
                        <tr key={entry._id}>
                          <td>
                            {
                              ACTIVITIES.find(
                                (a) => a.key === entry.activityType
                              )?.label
                            }
                          </td>
                          <td>{entry.score}/100</td>
                          <td>
                            {new Date(entry.createdAt).toLocaleDateString(
                              "en-IN",
                              { day: "2-digit", month: "short" }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </CaregiverPageLayout>
  );
};

export default CaregiverCognitive;
