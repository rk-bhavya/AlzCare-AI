import { useEffect, useState } from "react";

import { createMyCognitiveActivity } from "../../../api/patientDevice.api.js";

import MemoryGame from "../../CaregiverCognitive/games/MemoryGame.jsx";
import NumberRecallGame from "../../CaregiverCognitive/games/NumberRecallGame.jsx";
import PatternRecognitionGame from "../../CaregiverCognitive/games/PatternRecognitionGame.jsx";
import WordRecallGame from "../../CaregiverCognitive/games/WordRecallGame.jsx";

/* ============================================================
   PATIENT BRAIN EXERCISE

   Reuses the four EXISTING game components unchanged (they only
   call onComplete({ score, durationSeconds })) and saves each
   result through the existing patient-device cognitive-activity
   API, so results keep appearing in Caregiver > Patient
   Monitoring > Cognitive Progress.

   Status shown here comes only from the existing
   GET /patient-devices/me/cognitive-activities/today response
   ({ completedToday, latest }). That endpoint returns only
   today's most recent activity — there is no patient-device
   history endpoint — so "recent progress" is limited to that
   single latest result and is never padded or invented.
   Scores are informal engagement results, not a diagnosis.
============================================================ */

export const GAMES = [
  {
    key: "memory-game",
    label: "Memory Game",
    icon: "🧠",
    description: "Match the pairs of cards.",
  },
  {
    key: "number-recall",
    label: "Number Recall",
    icon: "🔢",
    description: "Remember the numbers you see.",
  },
  {
    key: "pattern-recognition",
    label: "Patterns",
    icon: "🎨",
    description: "Watch the colors, then repeat them.",
  },
  {
    key: "word-recall",
    label: "Word Recall",
    icon: "📝",
    description: "Remember the words you see.",
  },
];

const gameLabel = (key) => GAMES.find((g) => g.key === key)?.label || key;

const PatientBrainExercise = ({
  cognitiveStatus,
  onActivitySaved,
  onPlayingChange,
}) => {
  const [activeGame, setActiveGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  // Tell the parent when a game is on screen so it can hide the nav.
  useEffect(() => {
    onPlayingChange(Boolean(activeGame));
    return () => onPlayingChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGame]);

  const startGame = (key) => {
    setActiveGame(key);
    setGameResult(null);
    setSaveState("idle");
  };

  const closeGame = () => {
    setActiveGame(null);
    setGameResult(null);
    setSaveState("idle");
  };

  const handleGameComplete = async ({ score, durationSeconds }) => {
    setGameResult({ score, durationSeconds });
    setSaveState("saving");

    try {
      await createMyCognitiveActivity({
        activityType: activeGame,
        score,
        durationSeconds,
      });
      setSaveState("saved");
      onActivitySaved();
    } catch (error) {
      console.error("Unable to save activity result:", error);
      setSaveState("error");
    }
  };

  /* ---------------- PLAYING ---------------- */

  if (activeGame) {
    return (
      <div>
        <button className="patient-back-btn" onClick={closeGame}>
          ← Back
        </button>

        <div className="patient-card patient-card--game">
          <h2>{gameLabel(activeGame)}</h2>

          {gameResult ? (
            <div className="patient-game-result">
              <div className="patient-game-result__icon">🎉</div>
              <p>Great job!</p>
              <span>Score: {gameResult.score} / 100</span>

              {saveState === "saving" && (
                <span className="patient-save-note">Saving your result...</span>
              )}
              {saveState === "saved" && (
                <span className="patient-save-note patient-save-note--ok">
                  Your result has been saved.
                </span>
              )}
              {saveState === "error" && (
                <span className="patient-save-note patient-save-note--error">
                  We couldn't save your result. Please tell your caregiver.
                </span>
              )}

              <button
                className="patient-btn patient-btn--primary patient-btn--block"
                onClick={closeGame}
              >
                Done
              </button>
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
      </div>
    );
  }

  /* ---------------- GAME LIST ---------------- */

  const latest = cognitiveStatus?.latest;

  return (
    <div>
      <h1 className="patient-dash__title">🧠 Brain Exercise</h1>

      {/* TODAY'S STATUS */}
      <div
        className={`patient-card patient-status-card ${
          cognitiveStatus?.completedToday ? "patient-status-card--done" : ""
        }`}
      >
        <h3>
          {cognitiveStatus?.completedToday
            ? "✓ Done for today"
            : "Not done yet today"}
        </h3>

        {latest ? (
          <>
            <p className="patient-status-card__line">
              Latest: <strong>{gameLabel(latest.activityType)}</strong>
            </p>
            <p className="patient-status-card__line">
              Score: <strong>{latest.score} / 100</strong>
            </p>
            <p className="patient-status-card__line patient-status-card__muted">
              {new Date(latest.createdAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </>
        ) : (
          <p>No activity completed today yet. Pick a game below to start.</p>
        )}
      </div>

      {/* AVAILABLE GAMES */}
      <h2 className="patient-dash__section-title">CHOOSE A GAME</h2>

      {GAMES.map((game) => (
        <div className="patient-card patient-game-card" key={game.key}>
          <div className="patient-game-card__icon">{game.icon}</div>
          <div className="patient-game-card__body">
            <h3>{game.label}</h3>
            <p>{game.description}</p>
          </div>
          <button
            type="button"
            className="patient-btn patient-btn--primary"
            onClick={() => startGame(game.key)}
          >
            Start
          </button>
        </div>
      ))}
    </div>
  );
};

export default PatientBrainExercise;
