import { useEffect, useState } from "react";
import CatScoopPreview from "./CatScoopPreview";

interface Props {
  onPlay: () => void;
  onHighScores: () => void;
}

export default function StartScreen({ onPlay, onHighScores }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="game-card p-6 flex flex-col items-center gap-5 text-center"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? "translateY(0) scale(1)"
          : "translateY(20px) scale(0.95)",
        transition:
          "opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* Title area */}
      <div className="flex flex-col items-center gap-1">
        <h1
          className="text-4xl font-black tracking-tight"
          style={{ color: "oklch(0.35 0.12 290)" }}
        >
          🍦 Ice Cream Cat Stack
        </h1>
        <p
          className="text-base font-medium"
          style={{ color: "oklch(0.55 0.08 290)" }}
        >
          Stack the purr-fect tower
        </p>
      </div>

      {/* Preview canvas */}
      <div
        className="rounded-2xl overflow-hidden w-full max-w-xs"
        style={{
          boxShadow: "0 4px 24px oklch(0.68 0.18 350 / 0.3)",
          border: "2px solid oklch(0.88 0.05 320)",
        }}
      >
        <CatScoopPreview />
      </div>

      {/* Instructions */}
      <div
        className="rounded-2xl p-4 w-full"
        style={{ background: "oklch(0.94 0.05 320 / 0.5)" }}
      >
        <div
          className="space-y-2 text-sm font-medium"
          style={{ color: "oklch(0.35 0.08 290)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">👆</span>
            <span>Tap to drop cat scoops onto the cone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📐</span>
            <span>Land within range to stack them up</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span>Scoops swing faster as you score!</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">😿</span>
            <span>Miss and it's game over!</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          type="button"
          onClick={onPlay}
          className="btn-ice-cream w-full py-4 text-lg tracking-wide"
        >
          🍦 Play Now!
        </button>
        <button
          type="button"
          onClick={onHighScores}
          className="btn-mint w-full py-3 text-base tracking-wide"
        >
          🏆 High Scores
        </button>
      </div>

      {/* Footer */}
      <p
        className="text-xs opacity-50"
        style={{ color: "oklch(0.45 0.05 290)" }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </p>
    </div>
  );
}
