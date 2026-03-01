import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CatType {
  name: string;
  bodyColor: string;
  bodyColor2?: string;
  earColor: string;
  eyeColor: string;
  noseColor: string;
  markings?: "tabby" | "tuxedo" | "calico";
  stripeColor?: string;
  glowEyes?: boolean;
}

interface StackedScoop {
  x: number;
  y: number;
  catType: CatType;
  scale: number; // for bounce animation
  scaleTarget: number;
}

interface GameState {
  phase: "playing" | "gameover";
  swingX: number;
  swingAngle: number;
  swingSpeed: number;
  dropY: number;
  dropping: boolean;
  score: number;
  stack: StackedScoop[];
  currentCat: CatType;
  particles: Particle[];
  shakeAmount: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

// ─── Cat Definitions ─────────────────────────────────────────────────────────

const CAT_TYPES: CatType[] = [
  {
    name: "Tabby",
    bodyColor: "#E8A55A",
    earColor: "#D4894A",
    eyeColor: "#4CAF50",
    noseColor: "#FF8BA7",
    markings: "tabby",
    stripeColor: "#B8702A",
  },
  {
    name: "Calico",
    bodyColor: "#F5F0E8",
    bodyColor2: "#E8A55A",
    earColor: "#FFB7C5",
    eyeColor: "#8B6914",
    noseColor: "#FF8BA7",
    markings: "calico",
    stripeColor: "#2A2A2A",
  },
  {
    name: "Siamese",
    bodyColor: "#F5E8D0",
    earColor: "#8B6960",
    eyeColor: "#6AB4E8",
    noseColor: "#DBA8A0",
    stripeColor: "#7A5A50",
  },
  {
    name: "Black Cat",
    bodyColor: "#2C2C3A",
    earColor: "#1A1A24",
    eyeColor: "#00FF88",
    noseColor: "#8080A0",
    glowEyes: true,
  },
  {
    name: "Orange Tabby",
    bodyColor: "#FF8C42",
    earColor: "#E06A20",
    eyeColor: "#4CAF50",
    noseColor: "#FF6B9D",
    markings: "tabby",
    stripeColor: "#CC5500",
  },
  {
    name: "Tuxedo",
    bodyColor: "#F5F5F5",
    bodyColor2: "#2A2A2A",
    earColor: "#C8C8C8",
    eyeColor: "#FFD700",
    noseColor: "#FFB7C5",
    markings: "tuxedo",
  },
  {
    name: "Gray Kitty",
    bodyColor: "#B0B8C8",
    earColor: "#8892A0",
    eyeColor: "#70C8B8",
    noseColor: "#FFB7C5",
  },
  {
    name: "Lavender Dream",
    bodyColor: "#C8A8E8",
    earColor: "#A888D0",
    eyeColor: "#FF8BA7",
    noseColor: "#FF6B9D",
  },
];

// ─── Drawing Helpers ──────────────────────────────────────────────────────────

function drawCone(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const coneWidth = 70;
  const coneHeight = 110;

  // Cone shadow
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#7A5A2A";
  ctx.beginPath();
  ctx.moveTo(x - coneWidth / 2 - 4, y + 4);
  ctx.lineTo(x + coneWidth / 2 + 4, y + 4);
  ctx.lineTo(x + 4, y + coneHeight + 4);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // Cone body gradient
  const coneGrad = ctx.createLinearGradient(
    x - coneWidth / 2,
    y,
    x + coneWidth / 2,
    y,
  );
  coneGrad.addColorStop(0, "#E8C080");
  coneGrad.addColorStop(0.4, "#D4A860");
  coneGrad.addColorStop(1, "#B88840");

  ctx.beginPath();
  ctx.moveTo(x - coneWidth / 2, y);
  ctx.lineTo(x + coneWidth / 2, y);
  ctx.lineTo(x, y + coneHeight);
  ctx.closePath();
  ctx.fillStyle = coneGrad;
  ctx.fill();

  // Waffle pattern
  ctx.strokeStyle = "#A87830";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;

  // Horizontal lines
  const rows = 7;
  for (let i = 1; i < rows; i++) {
    const t = i / rows;
    const lineY = y + coneHeight * t;
    const halfW = (coneWidth / 2) * (1 - t);
    ctx.beginPath();
    ctx.moveTo(x - halfW, lineY);
    ctx.lineTo(x + halfW, lineY);
    ctx.stroke();
  }

  // Diagonal lines left
  for (let i = 0; i < 8; i++) {
    const startT = i / 8;
    const startY = y + coneHeight * startT;
    const startHalfW = (coneWidth / 2) * (1 - startT);
    const endT = Math.min(startT + 0.4, 1);
    const endY = y + coneHeight * endT;
    const endHalfW = (coneWidth / 2) * (1 - endT);

    ctx.beginPath();
    ctx.moveTo(x - startHalfW, startY);
    ctx.lineTo(x - endHalfW + (endHalfW - startHalfW) * 0.2, endY);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  // Cone rim
  ctx.beginPath();
  ctx.moveTo(x - coneWidth / 2 - 2, y);
  ctx.lineTo(x + coneWidth / 2 + 2, y);
  ctx.strokeStyle = "#C89840";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawCatScoop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  cat: CatType,
  scale = 1,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const r = radius;

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.ellipse(3, 4, r * 0.9, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#4A3060";
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // Body with gradient
  const bodyGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.3, 0, 0, 0, r);
  const lighterColor = lightenColor(cat.bodyColor, 30);
  bodyGrad.addColorStop(0, lighterColor);
  bodyGrad.addColorStop(1, cat.bodyColor);

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = darkenColor(cat.bodyColor, 20);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Calico patches
  if (cat.markings === "calico" && cat.bodyColor2 && cat.stripeColor) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    // Orange patch
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, r * 0.2, r * 0.4, r * 0.35, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = cat.bodyColor2;
    ctx.fill();

    // Black patch
    ctx.beginPath();
    ctx.ellipse(r * 0.4, -r * 0.15, r * 0.3, r * 0.4, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = cat.stripeColor!;
    ctx.fill();

    ctx.restore();
  }

  // Tuxedo
  if (cat.markings === "tuxedo" && cat.bodyColor2) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();

    // Black top/back
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI * 0.1, Math.PI * 1.1, false);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = cat.bodyColor2!;
    ctx.fill();

    ctx.restore();
  }

  // Tabby stripes
  if (cat.markings === "tabby" && cat.stripeColor) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = cat.stripeColor!;

    // Forehead stripes
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.fillRect(i * r * 0.25 - 3, -r * 0.7, 5, r * 0.4);
    }
    // Cheek stripes
    ctx.fillRect(-r * 0.8, -r * 0.1, r * 0.25, 4);
    ctx.fillRect(r * 0.55, -r * 0.1, r * 0.25, 4);
    ctx.fillRect(-r * 0.85, r * 0.1, r * 0.2, 3);
    ctx.fillRect(r * 0.65, r * 0.1, r * 0.2, 3);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Siamese face markings
  if (cat.stripeColor && !cat.markings) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = cat.stripeColor!;

    // Face mask
    ctx.beginPath();
    ctx.ellipse(0, r * 0.05, r * 0.5, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Left ear
  ctx.beginPath();
  ctx.moveTo(-r * 0.55, -r * 0.65);
  ctx.lineTo(-r * 0.8, -r * 1.05);
  ctx.lineTo(-r * 0.2, -r * 0.8);
  ctx.closePath();
  ctx.fillStyle = cat.earColor;
  ctx.fill();
  ctx.strokeStyle = darkenColor(cat.earColor, 15);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Right ear
  ctx.beginPath();
  ctx.moveTo(r * 0.55, -r * 0.65);
  ctx.lineTo(r * 0.8, -r * 1.05);
  ctx.lineTo(r * 0.2, -r * 0.8);
  ctx.closePath();
  ctx.fillStyle = cat.earColor;
  ctx.fill();
  ctx.strokeStyle = darkenColor(cat.earColor, 15);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner ear
  ctx.beginPath();
  ctx.moveTo(-r * 0.52, -r * 0.7);
  ctx.lineTo(-r * 0.72, -r * 0.98);
  ctx.lineTo(-r * 0.27, -r * 0.82);
  ctx.closePath();
  ctx.fillStyle = lightenColor(cat.earColor, 40);
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  ctx.moveTo(r * 0.52, -r * 0.7);
  ctx.lineTo(r * 0.72, -r * 0.98);
  ctx.lineTo(r * 0.27, -r * 0.82);
  ctx.closePath();
  ctx.fillStyle = lightenColor(cat.earColor, 40);
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Eyes
  const eyeY = -r * 0.12;
  const eyeSpacing = r * 0.32;
  const eyeRadius = r * 0.2;

  for (const ex of [-eyeSpacing, eyeSpacing]) {
    // Eye glow for black cat
    if (cat.glowEyes) {
      ctx.save();
      ctx.shadowColor = cat.eyeColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeRadius, eyeRadius * 1.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = cat.eyeColor;
      ctx.fill();
      ctx.restore();
    }

    // Eye white (not for black cat)
    if (!cat.glowEyes) {
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeRadius, eyeRadius * 1.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    }

    // Iris
    ctx.beginPath();
    ctx.ellipse(
      ex,
      eyeY,
      eyeRadius * 0.65,
      eyeRadius * 0.85,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = cat.eyeColor;
    ctx.fill();

    // Pupil
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, eyeRadius * 0.25, eyeRadius * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1A2A";
    ctx.fill();

    // Eye shine
    ctx.beginPath();
    ctx.arc(
      ex + eyeRadius * 0.2,
      eyeY - eyeRadius * 0.3,
      eyeRadius * 0.2,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      ex - eyeRadius * 0.15,
      eyeY + eyeRadius * 0.1,
      eyeRadius * 0.1,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();

    // Eye outline
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, eyeRadius, eyeRadius * 1.1, 0, 0, Math.PI * 2);
    ctx.strokeStyle = darkenColor(cat.eyeColor, 30);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Nose
  const noseY = r * 0.18;
  ctx.beginPath();
  ctx.moveTo(0, noseY + r * 0.09);
  ctx.lineTo(-r * 0.1, noseY);
  ctx.lineTo(r * 0.1, noseY);
  ctx.closePath();
  ctx.fillStyle = cat.noseColor;
  ctx.fill();
  ctx.strokeStyle = darkenColor(cat.noseColor, 20);
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Mouth
  ctx.beginPath();
  ctx.moveTo(-r * 0.14, noseY + r * 0.1);
  ctx.quadraticCurveTo(-r * 0.2, noseY + r * 0.25, -r * 0.1, noseY + r * 0.2);
  ctx.strokeStyle = darkenColor(cat.bodyColor, 35);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(r * 0.14, noseY + r * 0.1);
  ctx.quadraticCurveTo(r * 0.2, noseY + r * 0.25, r * 0.1, noseY + r * 0.2);
  ctx.stroke();

  // Whiskers
  ctx.strokeStyle = cat.bodyColor === "#2C2C3A" ? "#8080A0" : "#AAA0C0";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.8;

  // Left whiskers
  const whiskerPairs = [
    [-r * 0.18, noseY - r * 0.04, -r * 0.85, noseY - r * 0.12],
    [-r * 0.18, noseY + r * 0.05, -r * 0.88, noseY + r * 0.04],
    [-r * 0.18, noseY + r * 0.14, -r * 0.82, noseY + r * 0.22],
  ];
  for (const [x1, y1, x2, y2] of whiskerPairs) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Right whiskers
  const rWhiskers = [
    [r * 0.18, noseY - r * 0.04, r * 0.85, noseY - r * 0.12],
    [r * 0.18, noseY + r * 0.05, r * 0.88, noseY + r * 0.04],
    [r * 0.18, noseY + r * 0.14, r * 0.82, noseY + r * 0.22],
  ];
  for (const [x1, y1, x2, y2] of rWhiskers) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  // Highlight on scoop
  ctx.beginPath();
  ctx.ellipse(-r * 0.28, -r * 0.38, r * 0.22, r * 0.14, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fill();

  ctx.restore();
}

function lightenColor(hex: string, amount: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex: string, amount: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const SCOOP_RADIUS = 38;
const CONE_TOP_Y_OFFSET = 0.78; // y fraction from canvas top to cone rim
const SWING_AMPLITUDE = 0.35; // fraction of canvas width
const BASE_SWING_SPEED = 0.025;

interface Props {
  onGameOver: (score: number) => void;
}

export default function IceCreamCatGame({ onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [currentCatName, setCurrentCatName] = useState("Tabby");

  const getRandomCat = useCallback((): CatType => {
    return CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)];
  }, []);

  const spawnParticles = useCallback(
    (state: GameState, x: number, y: number, color: string) => {
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
        const speed = 2 + Math.random() * 4;
        state.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          color,
          life: 1,
          maxLife: 1,
          size: 4 + Math.random() * 6,
        });
      }
    },
    [],
  );

  const initGame = useCallback(() => {
    const firstCat = getRandomCat();
    gameRef.current = {
      phase: "playing",
      swingX: 0,
      swingAngle: 0,
      swingSpeed: BASE_SWING_SPEED,
      dropY: SCOOP_RADIUS + 20,
      dropping: false,
      score: 0,
      stack: [],
      currentCat: firstCat,
      particles: [],
      shakeAmount: 0,
    };
    setScoreDisplay(0);
    setCurrentCatName(firstCat.name);
  }, [getRandomCat]);

  const handleDrop = useCallback(() => {
    const state = gameRef.current;
    if (!state || state.dropping || state.phase !== "playing") return;
    state.dropping = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const maxW = Math.min(parent.clientWidth, 480);
      const h = Math.min(window.innerHeight * 0.82, 640);
      canvas.width = maxW;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    initGame();

    // Animation loop
    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 16.67, 3);
      lastTimeRef.current = time;

      const ctx = canvas.getContext("2d");
      if (!ctx || !gameRef.current) return;

      const state = gameRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const coneX = W / 2;
      const coneY = H * CONE_TOP_Y_OFFSET;
      const swingY = SCOOP_RADIUS + 30;
      const swingRange = W * SWING_AMPLITUDE;

      // ── Update ──────────────────────────────────────
      if (state.phase === "playing") {
        // Swing
        if (!state.dropping) {
          state.swingAngle += state.swingSpeed * dt;
          state.swingX = coneX + Math.sin(state.swingAngle) * swingRange;
        }

        // Drop
        if (state.dropping) {
          state.dropY += 10 * dt;

          // Determine landing target
          const landY =
            state.stack.length === 0
              ? coneY - SCOOP_RADIUS + 8
              : state.stack[state.stack.length - 1].y - SCOOP_RADIUS * 1.7;

          if (state.dropY >= landY) {
            // Check alignment
            const targetX =
              state.stack.length === 0
                ? coneX
                : state.stack[state.stack.length - 1].x;
            const diff = Math.abs(state.swingX - targetX);
            const tolerance =
              state.stack.length === 0 ? 55 : 45 + SCOOP_RADIUS * 0.3;

            if (diff <= tolerance) {
              // Success — clamp x so it doesn't drift too far
              const clampedX = Math.max(
                targetX - tolerance * 0.7,
                Math.min(targetX + tolerance * 0.7, state.swingX),
              );

              state.stack.push({
                x: clampedX,
                y: landY,
                catType: state.currentCat,
                scale: 1.25,
                scaleTarget: 1.0,
              });

              // Spawn particles
              spawnParticles(
                state,
                clampedX,
                landY,
                state.currentCat.bodyColor,
              );

              state.score += 1;
              setScoreDisplay(state.score);

              // Speed up slightly
              state.swingSpeed = Math.min(
                BASE_SWING_SPEED + state.score * 0.0025,
                0.09,
              );

              const nextCat = getRandomCat();
              state.currentCat = nextCat;
              setCurrentCatName(nextCat.name);

              // Reset
              state.dropping = false;
              state.dropY = SCOOP_RADIUS + 30;
              state.shakeAmount = 4;
            } else {
              // Miss — game over
              state.phase = "gameover";
              // brief shake then notify
              setTimeout(() => {
                onGameOver(state.score);
              }, 600);
            }
          }
        }

        // Bounce scale down
        for (const scoop of state.stack) {
          if (scoop.scale !== scoop.scaleTarget) {
            scoop.scale += (scoop.scaleTarget - scoop.scale) * 0.2 * dt;
            if (Math.abs(scoop.scale - scoop.scaleTarget) < 0.01)
              scoop.scale = scoop.scaleTarget;
          }
        }

        // Shake decay
        if (state.shakeAmount > 0.1) {
          state.shakeAmount *= 0.8;
        } else {
          state.shakeAmount = 0;
        }
      }

      // Particles
      for (const p of state.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.25 * dt;
        p.life -= 0.04 * dt;
      }
      state.particles = state.particles.filter((p) => p.life > 0);

      // ── Draw ─────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#d9f5ee");
      bgGrad.addColorStop(0.5, "#fce8f3");
      bgGrad.addColorStop(1, "#e8d9f5");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Polka dots background
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#c060a0";
      for (let row = 0; row < H / 40 + 1; row++) {
        for (let col = 0; col < W / 40 + 1; col++) {
          ctx.beginPath();
          ctx.arc(col * 40 + (row % 2) * 20, row * 40, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      const shakeX =
        state.shakeAmount > 0
          ? (Math.random() - 0.5) * state.shakeAmount * 2
          : 0;
      const shakeY =
        state.shakeAmount > 0 ? (Math.random() - 0.5) * state.shakeAmount : 0;

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Swing arm / bar
      if (state.phase === "playing") {
        // Arm bar background
        ctx.beginPath();
        ctx.moveTo(0, swingY);
        ctx.lineTo(W, swingY);
        ctx.strokeStyle = "rgba(180,150,220,0.2)";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Swing rope
        if (!state.dropping) {
          ctx.beginPath();
          ctx.moveTo(state.swingX, 0);
          ctx.lineTo(state.swingX, swingY);
          ctx.strokeStyle = "rgba(200,160,230,0.5)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Stacked scoops
      for (const scoop of state.stack) {
        drawCatScoop(
          ctx,
          scoop.x,
          scoop.y,
          SCOOP_RADIUS,
          scoop.catType,
          scoop.scale,
        );
      }

      // Cone
      drawCone(ctx, coneX, coneY);

      // Dropping / swinging scoop
      if (state.phase === "playing") {
        const drawX = state.swingX;
        const drawY = state.dropping ? state.dropY : swingY;
        drawCatScoop(ctx, drawX, drawY, SCOOP_RADIUS, state.currentCat);
      }

      // Particles
      for (const p of state.particles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      // Score on canvas (top right)
      ctx.save();
      ctx.font = "bold 26px Outfit, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "white";
      ctx.shadowColor = "rgba(180,100,200,0.6)";
      ctx.shadowBlur = 8;
      ctx.fillText(`✨ ${state.score}`, W - 16, 38);
      ctx.restore();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame((t) => {
      lastTimeRef.current = t;
      rafRef.current = requestAnimationFrame(loop);
    });

    // Input
    const handleClick = () => handleDrop();
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      handleDrop();
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", handleTouch, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchstart", handleTouch);
    };
  }, [initGame, handleDrop, getRandomCat, spawnParticles, onGameOver]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-2">
        <div className="score-badge px-4 py-1.5 text-sm font-bold">
          🍦 Score: {scoreDisplay}
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{
            background: "rgba(255,255,255,0.7)",
            color: "oklch(0.22 0.04 300)",
            backdropFilter: "blur(8px)",
          }}
        >
          🐱 {currentCatName}
        </div>
      </div>

      {/* Canvas */}
      <div
        className="w-full game-card overflow-hidden"
        style={{ cursor: "pointer" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ display: "block" }}
        />
      </div>

      <p
        className="text-sm text-center opacity-70 font-medium"
        style={{ color: "oklch(0.35 0.08 290)" }}
      >
        Tap or click to drop the scoop! 🐾
      </p>
    </div>
  );
}
