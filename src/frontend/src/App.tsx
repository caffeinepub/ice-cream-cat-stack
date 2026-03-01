import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import GameOverScreen from "./components/GameOverScreen";
import HighScoresScreen from "./components/HighScoresScreen";
import IceCreamCatGame from "./components/IceCreamCatGame";
import StartScreen from "./components/StartScreen";

export type GameScreen = "start" | "playing" | "gameover" | "highscores";

const queryClient = new QueryClient();

export default function App() {
  const [screen, setScreen] = useState<GameScreen>("start");
  const [finalScore, setFinalScore] = useState(0);

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setScreen("gameover");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.92 0.06 165), oklch(0.94 0.05 320) 50%, oklch(0.88 0.09 290))",
        }}
      >
        {/* Decorative background bubbles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { size: 120, x: 5, y: 10, hue: 350, delay: 0 },
            { size: 80, x: 90, y: 5, hue: 165, delay: 0.5 },
            { size: 60, x: 15, y: 80, hue: 290, delay: 1 },
            { size: 100, x: 85, y: 75, hue: 350, delay: 1.5 },
            { size: 40, x: 50, y: 3, hue: 80, delay: 0.8 },
            { size: 70, x: 45, y: 90, hue: 165, delay: 0.3 },
            { size: 50, x: 70, y: 40, hue: 290, delay: 2 },
            { size: 35, x: 25, y: 50, hue: 350, delay: 1.2 },
          ].map((b) => (
            <div
              key={`bubble-${b.x}-${b.y}`}
              className={`absolute rounded-full opacity-30 animate-float-${(Math.floor(b.delay) % 3) + 1}`}
              style={{
                width: b.size,
                height: b.size,
                left: `${b.x}%`,
                top: `${b.y}%`,
                background: `radial-gradient(circle at 35% 35%, oklch(0.95 0.08 ${b.hue}), oklch(0.80 0.14 ${b.hue}))`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
          {/* Sprinkle dots */}
          {[
            { x: 20, y: 25, color: "oklch(0.72 0.19 350)", rot: 15 },
            { x: 75, y: 30, color: "oklch(0.75 0.15 165)", rot: -20 },
            { x: 35, y: 65, color: "oklch(0.70 0.17 290)", rot: 45 },
            { x: 65, y: 70, color: "oklch(0.82 0.18 80)", rot: -30 },
            { x: 10, y: 45, color: "oklch(0.72 0.19 350)", rot: 60 },
            { x: 88, y: 50, color: "oklch(0.75 0.15 165)", rot: 10 },
            { x: 55, y: 15, color: "oklch(0.70 0.17 290)", rot: -45 },
            { x: 30, y: 85, color: "oklch(0.82 0.18 80)", rot: 30 },
          ].map((s) => (
            <div
              key={`sprinkle-${s.x}-${s.y}`}
              className="absolute opacity-60"
              style={{
                width: 8,
                height: 24,
                left: `${s.x}%`,
                top: `${s.y}%`,
                background: s.color,
                borderRadius: 4,
                transform: `rotate(${s.rot}deg)`,
              }}
            />
          ))}
        </div>

        {/* Game content */}
        <div className="relative z-10 w-full max-w-md mx-auto px-4">
          {screen === "start" && (
            <StartScreen
              onPlay={() => setScreen("playing")}
              onHighScores={() => setScreen("highscores")}
            />
          )}
          {screen === "playing" && (
            <IceCreamCatGame onGameOver={handleGameOver} />
          )}
          {screen === "gameover" && (
            <GameOverScreen
              score={finalScore}
              onPlayAgain={() => setScreen("playing")}
              onHighScores={() => setScreen("highscores")}
            />
          )}
          {screen === "highscores" && (
            <HighScoresScreen onBack={() => setScreen("start")} />
          )}
        </div>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
