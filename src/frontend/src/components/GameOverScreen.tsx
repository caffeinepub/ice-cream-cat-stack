import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface Props {
  score: number;
  onPlayAgain: () => void;
  onHighScores: () => void;
}

export default function GameOverScreen({
  score,
  onPlayAgain,
  onHighScores,
}: Props) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const getMessage = () => {
    if (score === 0) return "Oh no! 😿 No scoops stacked!";
    if (score < 3) return "Nice try! 🐱 Keep stacking!";
    if (score < 6) return "Pawsome! 😸 You're getting it!";
    if (score < 10) return "Purrfect! 🎉 Great stacking!";
    if (score < 15) return "Incredible! ⭐ Cat master!";
    return "Holy Meow-ceroni! You are a LEGEND OF CAT STACKING! 🏆";
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Enter your name first! 🐾");
      return;
    }
    if (!actor) {
      toast.error("Still connecting... try again!");
      return;
    }
    setSaving(true);
    try {
      await actor.saveScore(trimmedName, BigInt(score));
      setSaved(true);
      toast.success("Score saved! 🎊");
    } catch (_e) {
      toast.error("Couldn't save score. Try again!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="game-card p-6 flex flex-col items-center gap-5 text-center animate-bounce-in">
      {/* Game Over header */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-5xl">😿</div>
        <h2
          className="text-4xl font-black"
          style={{
            fontFamily: "Outfit, sans-serif",
            background:
              "linear-gradient(135deg, oklch(0.65 0.22 25), oklch(0.68 0.18 350))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Game Over!
        </h2>
        <p
          className="text-sm font-medium"
          style={{ color: "oklch(0.55 0.08 290)" }}
        >
          {getMessage()}
        </p>
      </div>

      {/* Score display */}
      <div
        className="rounded-3xl px-8 py-5 flex flex-col items-center gap-1"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.19 350 / 0.12), oklch(0.70 0.17 290 / 0.12))",
          border: "2px solid oklch(0.72 0.19 350 / 0.3)",
        }}
      >
        <span
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: "oklch(0.65 0.10 290)" }}
        >
          Scoops Stacked
        </span>
        <span
          className="text-6xl font-black"
          style={{
            fontFamily: "Outfit, sans-serif",
            background:
              "linear-gradient(135deg, oklch(0.68 0.18 350), oklch(0.65 0.20 290))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {score}
        </span>
        <span className="text-2xl">
          {score === 0 ? "🍦" : score < 5 ? "🐱" : score < 10 ? "😸" : "🏆"}
        </span>
      </div>

      {/* Save score section */}
      {!saved ? (
        <div
          className="rounded-2xl p-4 w-full flex flex-col gap-3"
          style={{ background: "oklch(0.94 0.05 320 / 0.5)" }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: "oklch(0.35 0.08 290)" }}
          >
            Save your score to the leaderboard! 🏅
          </p>
          <input
            type="text"
            placeholder="Your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
            style={{
              background: "white",
              border: "2px solid oklch(0.88 0.05 320)",
              color: "oklch(0.22 0.04 300)",
              fontFamily: "Outfit, sans-serif",
            }}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="btn-ice-cream w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving... 🐾" : "💾 Save Score"}
          </button>
        </div>
      ) : (
        <div
          className="rounded-2xl p-4 w-full flex items-center justify-center gap-2"
          style={{
            background: "oklch(0.75 0.15 165 / 0.2)",
            border: "2px solid oklch(0.75 0.15 165 / 0.4)",
          }}
        >
          <span className="text-2xl">✅</span>
          <span
            className="font-semibold text-sm"
            style={{ color: "oklch(0.35 0.10 165)" }}
          >
            Score saved! Check the leaderboard!
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          type="button"
          onClick={onPlayAgain}
          className="btn-ice-cream w-full py-4 text-lg tracking-wide"
        >
          🔄 Play Again!
        </button>
        <button
          type="button"
          onClick={onHighScores}
          className="btn-mint w-full py-3 text-base tracking-wide"
        >
          🏆 High Scores
        </button>
      </div>
    </div>
  );
}
