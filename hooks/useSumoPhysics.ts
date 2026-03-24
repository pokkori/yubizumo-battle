"use client";

import { useRef, useCallback, useState } from "react";

export type MatchPhase = "ready" | "fighting" | "roundOver" | "matchOver";
export type CpuDifficulty = "easy" | "normal" | "hard";

export interface SumoState {
  phase: MatchPhase;
  p1Score: number;
  p2Score: number;
  winner: 1 | 2 | null;
  roundWinner: 1 | 2 | null;
}

const CANVAS_W = 360;
const CANVAS_H = 560;
const DOHYO_CX = CANVAS_W / 2;
const DOHYO_CY = CANVAS_H / 2;
const DOHYO_R = 130;
const WRESTLER_R = 32;
const WINNING_SCORE = 3;

// CPU difficulty parameters
const CPU_PARAMS: Record<CpuDifficulty, { interval: number; force: number; accuracy: number; reactionDelay: number }> = {
  easy:   { interval: 800, force: 8,  accuracy: 0.4, reactionDelay: 400 },
  normal: { interval: 500, force: 12, accuracy: 0.7, reactionDelay: 200 },
  hard:   { interval: 300, force: 16, accuracy: 0.9, reactionDelay: 80  },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img); // fallback: draw broken image gracefully
    img.src = src;
  });
}

export function useSumoPhysics(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [state, setState] = useState<SumoState>({
    phase: "ready", p1Score: 0, p2Score: 0, winner: null, roundWinner: null,
  });
  const stateRef = useRef<SumoState>({ phase: "ready", p1Score: 0, p2Score: 0, winner: null, roundWinner: null });
  const engineRef = useRef<import("matter-js").Engine | null>(null);
  const runnerRef = useRef<import("matter-js").Runner | null>(null);
  const p1Ref = useRef<import("matter-js").Body | null>(null);
  const p2Ref = useRef<import("matter-js").Body | null>(null);
  const rafRef = useRef<number>(0);
  const cpuIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const p1TouchRef = useRef<{ id: number; startX: number; startY: number } | null>(null);
  const p2TouchRef = useRef<{ id: number; startX: number; startY: number } | null>(null);
  const p1ImgRef = useRef<HTMLImageElement | null>(null);
  const p2ImgRef = useRef<HTMLImageElement | null>(null);

  const endRoundRef = useRef<(winner: 1 | 2) => void>(() => {});

  const stopCpu = useCallback(() => {
    if (cpuIntervalRef.current) {
      clearInterval(cpuIntervalRef.current);
      cpuIntervalRef.current = null;
    }
  }, []);

  const endRound = useCallback((winner: 1 | 2) => {
    if (stateRef.current.phase !== "fighting") return;
    const newP1 = winner === 1 ? stateRef.current.p1Score + 1 : stateRef.current.p1Score;
    const newP2 = winner === 2 ? stateRef.current.p2Score + 1 : stateRef.current.p2Score;
    const matchOver = newP1 >= WINNING_SCORE || newP2 >= WINNING_SCORE;
    const next: SumoState = {
      phase: matchOver ? "matchOver" : "roundOver",
      p1Score: newP1,
      p2Score: newP2,
      roundWinner: winner,
      winner: matchOver ? winner : null,
    };
    stateRef.current = next;
    setState({ ...next });
    stopCpu();
    if (runnerRef.current) {
      import("matter-js").then(Matter => {
        if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      });
    }
    cancelAnimationFrame(rafRef.current);
  }, [stopCpu]);

  endRoundRef.current = endRound;

  const startCpuAI = useCallback(async (difficulty: CpuDifficulty) => {
    const Matter = await import("matter-js");
    const params = CPU_PARAMS[difficulty];

    // Initial reaction delay before CPU starts acting
    await new Promise(r => setTimeout(r, params.reactionDelay));

    cpuIntervalRef.current = setInterval(() => {
      if (stateRef.current.phase !== "fighting") return;
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;
      if (!p1 || !p2) return;

      // CPU controls P2 (blue, top)
      const dx = p1.position.x - p2.position.x;
      const dy = p1.position.y - p2.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.1) return;

      // Add randomness based on accuracy (lower accuracy = more random)
      const randomAngle = (1 - params.accuracy) * (Math.random() - 0.5) * Math.PI;
      const baseAngle = Math.atan2(dy, dx);
      const finalAngle = baseAngle + randomAngle;

      // Strategic: if CPU is near edge, retreat toward center
      const cpuDistFromCenter = Math.hypot(p2.position.x - DOHYO_CX, p2.position.y - DOHYO_CY);
      let targetAngle = finalAngle;
      if (cpuDistFromCenter > DOHYO_R * 0.65) {
        // Blend toward center
        const toCenterAngle = Math.atan2(DOHYO_CY - p2.position.y, DOHYO_CX - p2.position.x);
        targetAngle = finalAngle * 0.4 + toCenterAngle * 0.6;
      }

      const forceScale = params.force * (0.8 + Math.random() * 0.4);
      Matter.Body.setVelocity(p2, {
        x: p2.velocity.x + Math.cos(targetAngle) * forceScale * 0.4,
        y: p2.velocity.y + Math.sin(targetAngle) * forceScale * 0.4,
      });
    }, params.interval);
  }, []);

  const initRound = useCallback(async (cpuDifficulty?: CpuDifficulty) => {
    const Matter = await import("matter-js");
    const canvas = canvasRef.current;
    if (!canvas) return;

    stopCpu();
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    cancelAnimationFrame(rafRef.current);

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    engineRef.current = engine;

    const p1 = Matter.Bodies.circle(DOHYO_CX - 60, DOHYO_CY + 40, WRESTLER_R, {
      restitution: 0.3, friction: 0.1, frictionAir: 0.08, mass: 5,
      label: "p1",
    });
    const p2 = Matter.Bodies.circle(DOHYO_CX + 60, DOHYO_CY - 40, WRESTLER_R, {
      restitution: 0.3, friction: 0.1, frictionAir: 0.08, mass: 5,
      label: "p2",
    });

    p1Ref.current = p1;
    p2Ref.current = p2;

    Matter.Composite.add(engine.world, [p1, p2]);

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    const nextState: SumoState = { ...stateRef.current, phase: "fighting", roundWinner: null };
    stateRef.current = nextState;
    setState({ ...nextState });

    // Start CPU AI if in CPU mode
    if (cpuDifficulty) {
      startCpuAI(cpuDifficulty);
    }

    // Load wrestler images
    if (!p1ImgRef.current) {
      loadImage("/images/player1.png").then(img => { p1ImgRef.current = img; });
    }
    if (!p2ImgRef.current) {
      const src = cpuDifficulty ? "/images/cpu.png" : "/images/player2.png";
      loadImage(src).then(img => { p2ImgRef.current = img; });
    }

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const bg = ctx.createRadialGradient(DOHYO_CX, DOHYO_CY, 0, DOHYO_CX, DOHYO_CY, CANVAS_H * 0.8);
      bg.addColorStop(0, "#3d0f0f");
      bg.addColorStop(1, "#1a0505");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.beginPath();
      ctx.arc(DOHYO_CX, DOHYO_CY, DOHYO_R + 12, 0, Math.PI * 2);
      ctx.fillStyle = "#92400e";
      ctx.fill();

      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const x = DOHYO_CX + (DOHYO_R + 6) * Math.cos(angle);
        const y = DOHYO_CY + (DOHYO_R + 6) * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? "#d97706" : "#92400e";
        ctx.fill();
      }

      const dohyoGrad = ctx.createRadialGradient(DOHYO_CX - 20, DOHYO_CY - 20, 0, DOHYO_CX, DOHYO_CY, DOHYO_R);
      dohyoGrad.addColorStop(0, "#fde68a");
      dohyoGrad.addColorStop(0.6, "#f59e0b");
      dohyoGrad.addColorStop(1, "#d97706");
      ctx.beginPath();
      ctx.arc(DOHYO_CX, DOHYO_CY, DOHYO_R, 0, Math.PI * 2);
      ctx.fillStyle = dohyoGrad;
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(DOHYO_CX - DOHYO_R, DOHYO_CY);
      ctx.lineTo(DOHYO_CX + DOHYO_R, DOHYO_CY);
      ctx.stroke();
      ctx.setLineDash([]);

      const p1pos = p1.position;
      ctx.save();
      ctx.translate(p1pos.x, p1pos.y);
      ctx.rotate(p1.angle);
      ctx.shadowColor = "#dc2626";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, WRESTLER_R, 0, Math.PI * 2);
      ctx.fillStyle = "#dc2626";
      ctx.fill();
      ctx.shadowBlur = 0;
      if (p1ImgRef.current?.complete && p1ImgRef.current.naturalWidth > 0) {
        ctx.drawImage(p1ImgRef.current, -WRESTLER_R, -WRESTLER_R, WRESTLER_R * 2, WRESTLER_R * 2);
      } else {
        ctx.font = (WRESTLER_R * 1.1) + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u{1F534}", 0, 0);
      }
      ctx.restore();

      const p2pos = p2.position;
      ctx.save();
      ctx.translate(p2pos.x, p2pos.y);
      ctx.rotate(p2.angle);
      ctx.shadowColor = "#2563eb";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, WRESTLER_R, 0, Math.PI * 2);
      ctx.fillStyle = "#2563eb";
      ctx.fill();
      ctx.shadowBlur = 0;
      if (p2ImgRef.current?.complete && p2ImgRef.current.naturalWidth > 0) {
        ctx.drawImage(p2ImgRef.current, -WRESTLER_R, -WRESTLER_R, WRESTLER_R * 2, WRESTLER_R * 2);
      } else {
        ctx.font = (WRESTLER_R * 1.1) + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u{1F535}", 0, 0);
      }
      ctx.restore();

      ctx.fillStyle = "#dc2626";
      ctx.font = "bold 18px system-ui";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(" " + stateRef.current.p1Score, 12, CANVAS_H - 8);

      ctx.save();
      ctx.translate(CANVAS_W, 0);
      ctx.rotate(Math.PI);
      ctx.fillStyle = "#3b82f6";
      ctx.font = "bold 18px system-ui";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(" " + stateRef.current.p2Score, 12, CANVAS_H - 8);
      ctx.restore();

      if (stateRef.current.phase === "fighting") {
        const p1dist = Math.hypot(p1pos.x - DOHYO_CX, p1pos.y - DOHYO_CY);
        const p2dist = Math.hypot(p2pos.x - DOHYO_CX, p2pos.y - DOHYO_CY);

        if (p1dist > DOHYO_R + WRESTLER_R * 0.5) {
          endRoundRef.current(2);
          return;
        } else if (p2dist > DOHYO_R + WRESTLER_R * 0.5) {
          endRoundRef.current(1);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
  }, [canvasRef, stopCpu, startCpuAI]);

  const applyImpulse = useCallback(async (player: 1 | 2, vx: number, vy: number) => {
    if (stateRef.current.phase !== "fighting") return;
    const Matter = await import("matter-js");
    const body = player === 1 ? p1Ref.current : p2Ref.current;
    if (!body) return;
    const mag = Math.sqrt(vx * vx + vy * vy);
    const speed = Math.min(mag, 25);
    const scale = mag > 0.001 ? speed / mag : 0;
    Matter.Body.setVelocity(body, {
      x: body.velocity.x + vx * scale * 0.4,
      y: body.velocity.y + vy * scale * 0.4,
    });
  }, []);

  const resetMatch = useCallback(() => {
    stopCpu();
    p2ImgRef.current = null; // Reset so correct image loads next round (CPU vs P2)
    const next: SumoState = { phase: "ready", p1Score: 0, p2Score: 0, winner: null, roundWinner: null };
    stateRef.current = next;
    setState({ ...next });
    cancelAnimationFrame(rafRef.current);
    if (runnerRef.current) {
      import("matter-js").then(Matter => {
        if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      });
    }
  }, [stopCpu]);

  return { state, initRound, applyImpulse, resetMatch, p1TouchRef, p2TouchRef };
}
