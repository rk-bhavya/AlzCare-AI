import { useEffect, useState } from "react";

const WORD_BANK = [
  "Apple", "River", "Chair", "Garden", "Bridge", "Candle",
  "Window", "Forest", "Pencil", "Ocean", "Mountain", "Blanket",
  "Butter", "Silver", "Basket", "Cloud", "Guitar", "Harbor",
];

const shuffle = (array) =>
  [...array].sort(() => Math.random() - 0.5);

const WordRecallGame = ({ onComplete }) => {
  const [shownWords] = useState(() => shuffle(WORD_BANK).slice(0, 6));
  const [optionWords] = useState(() => {
    const decoys = shuffle(
      WORD_BANK.filter((word) => !shownWords.includes(word))
    ).slice(0, 6);
    return shuffle([...shownWords, ...decoys]);
  });

  const [phase, setPhase] = useState("show"); // show -> recall -> done
  const [selectedWords, setSelectedWords] = useState([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (phase !== "show") return;
    const timeout = setTimeout(() => setPhase("recall"), 5000);
    return () => clearTimeout(timeout);
  }, [phase]);

  const toggleWord = (word) => {
    if (phase !== "recall") return;

    setSelectedWords((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word]
    );
  };

  const handleSubmit = () => {
    const correctSelections = selectedWords.filter((word) =>
      shownWords.includes(word)
    ).length;

    const incorrectSelections = selectedWords.filter(
      (word) => !shownWords.includes(word)
    ).length;

    const rawScore =
      (correctSelections / shownWords.length) * 100 -
      incorrectSelections * 10;

    const score = Math.max(0, Math.min(100, Math.round(rawScore)));
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    setPhase("done");
    onComplete({ score, durationSeconds });
  };

  return (
    <div style={{ padding: "10px 0" }}>
      {phase === "show" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ fontSize: 13, color: "#6b7690", marginBottom: 16 }}>
            Memorize these words — you'll be asked to identify them next:
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            {shownWords.map((word) => (
              <span
                key={word}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: "#14b8a6",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {phase === "recall" && (
        <div>
          <p style={{ fontSize: 13, color: "#6b7690", marginBottom: 14 }}>
            Select the words you saw earlier:
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 10,
              maxWidth: 520,
            }}
          >
            {optionWords.map((word) => {
              const isSelected = selectedWords.includes(word);
              return (
                <button
                  key={word}
                  type="button"
                  onClick={() => toggleWord(word)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: isSelected
                      ? "2px solid #14b8a6"
                      : "1px solid #dbe1eb",
                    background: isSelected ? "#e0f7f4" : "#ffffff",
                    color: "#17233c",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="cg-btn cg-btn--primary"
            style={{ marginTop: 18 }}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default WordRecallGame;
