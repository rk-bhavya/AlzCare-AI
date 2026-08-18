import { useEffect, useState } from "react";

const TILE_COLORS = ["#f87171", "#60a5fa", "#facc15", "#4ade80"];
const ROUNDS = 5;

const PatternRecognitionGame = ({ onComplete }) => {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle -> show -> input -> done
  const [activeTile, setActiveTile] = useState(null);
  const [round, setRound] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [startTime] = useState(Date.now());

  const startRound = (nextPattern) => {
    setPattern(nextPattern);
    setUserPattern([]);
    setPhase("show");
  };

  useEffect(() => {
    if (round === 0) {
      startRound([Math.floor(Math.random() * 4)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "show") return;

    let index = 0;
    const interval = setInterval(() => {
      setActiveTile(pattern[index]);
      setTimeout(() => setActiveTile(null), 400);
      index += 1;

      if (index >= pattern.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("input"), 500);
      }
    }, 700);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pattern]);

  const finishGame = (finalCorrectRounds) => {
    const score = Math.round((finalCorrectRounds / ROUNDS) * 100);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    setPhase("done");
    onComplete({ score, durationSeconds });
  };

  const handleTileClick = (tileIndex) => {
    if (phase !== "input") return;

    const nextUserPattern = [...userPattern, tileIndex];
    setUserPattern(nextUserPattern);

    const isCorrectSoFar = nextUserPattern.every(
      (value, i) => value === pattern[i]
    );

    if (!isCorrectSoFar) {
      const nextRound = round + 1;
      if (nextRound >= ROUNDS) {
        finishGame(correctRounds);
      } else {
        setRound(nextRound);
        startRound([...pattern, Math.floor(Math.random() * 4)]);
      }
      return;
    }

    if (nextUserPattern.length === pattern.length) {
      const nextCorrectRounds = correctRounds + 1;
      setCorrectRounds(nextCorrectRounds);

      const nextRound = round + 1;
      if (nextRound >= ROUNDS) {
        finishGame(nextCorrectRounds);
      } else {
        setRound(nextRound);
        startRound([...pattern, Math.floor(Math.random() * 4)]);
      }
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <p style={{ fontSize: 13, color: "#6b7690", marginBottom: 16 }}>
        {phase === "show"
          ? "Watch the pattern..."
          : phase === "input"
          ? `Repeat the pattern (round ${round + 1} of ${ROUNDS})`
          : "Get ready..."}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 100px)",
          gap: 12,
          justifyContent: "center",
          margin: "0 auto",
        }}
      >
        {TILE_COLORS.map((color, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleTileClick(index)}
            disabled={phase !== "input"}
            style={{
              width: 100,
              height: 100,
              borderRadius: 14,
              border: "none",
              background: color,
              opacity: activeTile === index ? 1 : phase === "input" ? 0.85 : 0.35,
              transform: activeTile === index ? "scale(1.06)" : "scale(1)",
              transition: "all 0.15s ease",
              cursor: phase === "input" ? "pointer" : "default",
            }}
          />
        ))}
      </div>

      <p style={{ fontSize: 12, color: "#8b96ab", marginTop: 16 }}>
        Correct rounds: {correctRounds} / {ROUNDS}
      </p>
    </div>
  );
};

export default PatternRecognitionGame;
