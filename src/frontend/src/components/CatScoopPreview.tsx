import { useEffect, useRef } from "react";

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

function drawCone(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const coneWidth = 70;
  const coneHeight = 90;

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

  ctx.strokeStyle = "#A87830";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.6;

  const rows = 6;
  for (let i = 1; i < rows; i++) {
    const t = i / rows;
    const lineY = y + coneHeight * t;
    const halfW = (coneWidth / 2) * (1 - t);
    ctx.beginPath();
    ctx.moveTo(x - halfW, lineY);
    ctx.lineTo(x + halfW, lineY);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

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
) {
  ctx.save();
  ctx.translate(x, y);

  const r = radius;

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.ellipse(3, 4, r * 0.9, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#4A3060";
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

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

  if (cat.markings === "calico" && cat.bodyColor2 && cat.stripeColor) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, r * 0.2, r * 0.4, r * 0.35, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = cat.bodyColor2;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.4, -r * 0.15, r * 0.3, r * 0.4, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = cat.stripeColor;
    ctx.fill();
    ctx.restore();
  }

  if (cat.markings === "tuxedo" && cat.bodyColor2) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI * 0.1, Math.PI * 1.1, false);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = cat.bodyColor2;
    ctx.fill();
    ctx.restore();
  }

  if (cat.markings === "tabby" && cat.stripeColor) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = cat.stripeColor;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.fillRect(i * r * 0.25 - 3, -r * 0.7, 5, r * 0.4);
    }
    ctx.fillRect(-r * 0.8, -r * 0.1, r * 0.25, 4);
    ctx.fillRect(r * 0.55, -r * 0.1, r * 0.25, 4);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  if (cat.stripeColor && !cat.markings) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = cat.stripeColor;
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

    if (!cat.glowEyes) {
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, eyeRadius, eyeRadius * 1.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    }

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

    ctx.beginPath();
    ctx.ellipse(ex, eyeY, eyeRadius * 0.25, eyeRadius * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1A1A2A";
    ctx.fill();

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

  const whiskerPairs: [number, number, number, number][] = [
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

  const rWhiskers: [number, number, number, number][] = [
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

  // Highlight
  ctx.beginPath();
  ctx.ellipse(-r * 0.28, -r * 0.38, r * 0.22, r * 0.14, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fill();

  ctx.restore();
}

export default function CatScoopPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    const cat = CAT_TYPES[Math.floor(Math.random() * CAT_TYPES.length)];
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    // Tumble: slow oscillating rotation that rocks back and forth
    let startTime: number | null = null;

    function draw(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;

      // Oscillate: sin wave gives a rocking/tumbling feel
      // Full tumble: goes past 180 slowly then comes back -- use continuous rotation
      // Use a smooth eased pendulum swing: sin(elapsed * speed) * maxAngle
      const angle = Math.sin(elapsed * 1.4) * 0.6 + elapsed * 0.8;
      angleRef.current = angle;

      context.clearRect(0, 0, W, H);

      // Background
      const bg = context.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "oklch(0.96 0.04 320)");
      bg.addColorStop(1, "oklch(0.90 0.06 290)");
      context.fillStyle = bg;
      context.fillRect(0, 0, W, H);

      context.save();
      context.translate(cx, cy);
      context.rotate(angle);

      // Draw cone centered, scoop sits on top of cone
      const _coneHeight = 90;
      const radius = 52;
      // Cone top at -coneHeight/2 + a bit, scoop above that
      const coneTopY = 10;
      const scoopY = coneTopY - radius;

      drawCone(context, 0, coneTopY);
      drawCatScoop(context, 0, scoopY, radius, cat);

      context.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      className="w-full"
      style={{ maxHeight: 160, display: "block" }}
    />
  );
}
