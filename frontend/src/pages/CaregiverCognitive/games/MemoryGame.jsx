import { useEffect, useState } from "react";
import { FaBrain, FaHeart, FaStar, FaSun, FaMoon, FaLeaf, FaBell, FaGem } from "react-icons/fa";

const ICONS = [FaBrain, FaHeart, FaStar, FaSun, FaMoon, FaLeaf, FaBell, FaGem];

const buildDeck = () => {
  const chosen = ICONS.slice(0, 6);
  const pairs = [...chosen, ...chosen].map((Icon, index) => ({
    id: index,
    Icon,
    iconIndex: chosen.indexOf(Icon),
  }));

  return pairs
    .map((card) => ({ ...card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort);
};

const MemoryGame = ({ onComplete }) => {
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      setMoves((m) => m + 1);

      if (deck[first].iconIndex === deck[second].iconIndex) {
        setMatched((prev) => [...prev, first, second]);
        setFlipped([]);
      } else {
        const timeout = setTimeout(() => setFlipped([]), 800);
        return () => clearTimeout(timeout);
      }
    }
  }, [flipped, deck]);

  useEffect(() => {
    if (matched.length === deck.length && deck.length > 0) {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);
      const idealMoves = deck.length / 2;
      const score = Math.max(
        20,
        Math.min(100, Math.round((idealMoves / moves) * 100))
      );

      onComplete({ score, durationSeconds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  const handleFlip = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    ) {
      return;
    }

    setFlipped((prev) => [...prev, index]);
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6b7690", marginBottom: 14 }}>
        Moves: {moves} &nbsp;•&nbsp; Matched: {matched.length / 2} / {deck.length / 2}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          maxWidth: 420,
        }}
      >
        {deck.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          const Icon = card.Icon;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(index)}
              style={{
                aspectRatio: "1",
                borderRadius: 12,
                border: "1px solid #dbe1eb",
                background: isFlipped ? "#e0f7f4" : "#14213d",
                color: isFlipped ? "#0f9e8e" : "#14213d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              {isFlipped && <Icon />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryGame;
