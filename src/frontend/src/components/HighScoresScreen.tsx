import { useEffect, useState } from "react";
import type { ScoreEntry } from "../backend.d.ts";
import { useActor } from "../hooks/useActor";

interface Props {
  onBack: () => void;
}

const RANK_EMOJIS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000; // nanoseconds to ms
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function HighScoresScreen({ onBack }: Props) {
  const { actor, isFetching } = useActor();
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isFetching || !actor) return;
    let cancelled = false;
    setLoading(true);
    actor
      .getTopScores()
      .then((data) => {
        if (!cancelled) {
          const sorted = [...data].sort(
            (a, b) => Number(b.score) - Number(a.score),
          );
          setScores(sorted.slice(0, 10));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  return (
    <div className="game-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="text-4xl">🏆</div>
        <h2
          className="text-3xl font-black"
          style={{
            fontFamily: "Outfit, sans-serif",
            background:
              "linear-gradient(135deg, oklch(0.68 0.18 350), oklch(0.65 0.20 290))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Top Stackers
        </h2>
        <p
          className="text-sm font-medium"
          style={{ color: "oklch(0.55 0.08 290)" }}
        >
          The best ice cream cat towers 🍦
        </p>
      </div>

      {/* Scores list */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }, (_, i) => i).map((i) => (
              <div
                key={`skeleton-${i}`}
                className="rounded-xl h-14 animate-pulse"
                style={{
                  background: "oklch(0.92 0.04 290 / 0.5)",
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: "oklch(0.95 0.03 25 / 0.3)" }}
          >
            <div className="text-3xl mb-2">😿</div>
            <p
              className="text-sm font-semibold"
              style={{ color: "oklch(0.45 0.10 25)" }}
            >
              Couldn't load scores. Check your connection!
            </p>
          </div>
        ) : scores.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center flex flex-col items-center gap-3"
            style={{ background: "oklch(0.94 0.05 320 / 0.5)" }}
          >
            <div className="text-4xl">🍦</div>
            <p
              className="font-semibold text-sm"
              style={{ color: "oklch(0.45 0.08 290)" }}
            >
              No scores yet — be the first to stack!
            </p>
          </div>
        ) : (
          scores.map((entry, i) => (
            <div
              key={`${entry.name}-${String(entry.score)}-${i}`}
              className="leaderboard-row rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                border:
                  i < 3
                    ? `2px solid oklch(${i === 0 ? "0.85 0.15 80" : i === 1 ? "0.78 0.06 200" : "0.72 0.12 50"})`
                    : "2px solid oklch(0.90 0.03 290 / 0.5)",
                background: i >= 3 ? "oklch(0.97 0.02 290 / 0.5)" : undefined,
              }}
            >
              <span className="text-2xl w-8 text-center flex-shrink-0">
                {RANK_EMOJIS[i] || `${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold text-sm truncate"
                  style={{ color: "oklch(0.22 0.04 300)" }}
                >
                  {entry.name}
                </p>
                {formatDate(entry.timestamp) && (
                  <p
                    className="text-xs opacity-60"
                    style={{ color: "oklch(0.45 0.06 290)" }}
                  >
                    {formatDate(entry.timestamp)}
                  </p>
                )}
              </div>
              <div
                className="flex-shrink-0 rounded-full px-3 py-1 text-sm font-black"
                style={{
                  background:
                    i === 0
                      ? "linear-gradient(135deg, oklch(0.82 0.18 80), oklch(0.75 0.15 80))"
                      : i === 1
                        ? "linear-gradient(135deg, oklch(0.80 0.05 200), oklch(0.72 0.06 200))"
                        : i === 2
                          ? "linear-gradient(135deg, oklch(0.72 0.12 50), oklch(0.65 0.10 50))"
                          : "oklch(0.88 0.09 290 / 0.5)",
                  color: i < 3 ? "white" : "oklch(0.35 0.08 290)",
                }}
              >
                {Number(entry.score)} 🍦
              </div>
            </div>
          ))
        )}
      </div>

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="btn-mint w-full py-3 text-base tracking-wide"
      >
        ← Back to Menu
      </button>

      {/* Footer */}
      <p
        className="text-xs text-center opacity-40"
        style={{ color: "oklch(0.45 0.05 290)" }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </p>
    </div>
  );
}
