import { useEffect, useState } from "react";

const SEQUENCE_LENGTH = 6;

const generateSequence = () =>
  Array.from({ length: SEQUENCE_LENGTH }, () =>
    Math.floor(Math.random() * 10)
  );

const NumberRecallGame = ({ onComplete }) => {
  const [sequence] = useState(generateSequence);
  const [phase, setPhase] = useState("show"); // show -> recall -> done
  const [userInput, setUserInput] = useState("");
  const [startTime] = useState(Date.now());
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (phase !== "show") return;

    if (visibleCount < sequence.length) {
      const timeout = setTimeout(() => setVisibleCount((c) => c + 1), 900);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => setPhase("recall"), 900);
    return () => clearTimeout(timeout);
  }, [phase, visibleCount, sequence.length]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const answerDigits = userInput.trim().split("").filter((c) => /\d/.test(c));

    let correct = 0;
    answerDigits.forEach((digit, index) => {
      if (Number(digit) === sequence[index]) correct += 1;
    });

    const score = Math.round((correct / sequence.length) * 100);
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    setPhase("done");
    onComplete({ score, durationSeconds });
  };

  return (
    <div>
      {phase === "show" && (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <p style={{ fontSize: 13, color: "#6b7690", marginBottom: 16 }}>
            Memorize this sequence of numbers:
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {sequence.slice(0, visibleCount).map((digit, index) => (
              <div
                key={index}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: "#14b8a6",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "recall" && (
        <form onSubmit={handleSubmit} style={{ padding: "20px 0" }}>
          <p style={{ fontSize: 13, color: "#6b7690", marginBottom: 12 }}>
            Now type the {sequence.length}-digit sequence you just saw:
          </p>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            maxLength={sequence.length}
            autoFocus
            style={{
              fontSize: 22,
              letterSpacing: 8,
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #dbe1eb",
              width: 220,
              textAlign: "center",
            }}
            placeholder="e.g. 483920"
          />
          <div style={{ marginTop: 16 }}>
            <button type="submit" className="cg-btn cg-btn--primary">
              Submit Answer
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NumberRecallGame;
