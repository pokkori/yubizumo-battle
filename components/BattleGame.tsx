"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { useSumoPhysics, CpuDifficulty } from "@/hooks/useSumoPhysics";
import { useGameSounds } from "@/hooks/useGameSounds";

const CANVAS_W = 360;
const CANVAS_H = 560;

type GameMode = "select" | "difficulty" | "playing";

const DIFFICULTY_OPTIONS: { key: CpuDifficulty; label: string; desc: string; color: string }[] = [
  { key: "easy",   label: "よわい", desc: "のんびり相撲", color: "#22c55e" },
  { key: "normal", label: "ふつう", desc: "いい勝負！",   color: "#f59e0b" },
  { key: "hard",   label: "つよい", desc: "横綱級の強さ", color: "#ef4444" },
];

export default function BattleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, initRound, applyImpulse, resetMatch, p1TouchRef, p2TouchRef } = useSumoPhysics(canvasRef);
  const { playStart, playRoundWin, playMatchWin } = useGameSounds();

  const [gameMode, setGameMode] = useState<GameMode>("select");
  const [isCpu, setIsCpu] = useState(false);
  const [cpuDifficulty, setCpuDifficulty] = useState<CpuDifficulty>("normal");

  useEffect(() => {
    if (state.phase === "fighting") playStart();
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === "roundOver") playRoundWin();
    if (state.phase === "matchOver") playMatchWin();
  }, [state.phase]);

  const startGame = useCallback((cpu: boolean, difficulty?: CpuDifficulty) => {
    setIsCpu(cpu);
    if (difficulty) setCpuDifficulty(difficulty);
    setGameMode("playing");
    resetMatch();
  }, [resetMatch]);

  const handleStartRound = useCallback(() => {
    initRound(isCpu ? cpuDifficulty : undefined);
  }, [initRound, isCpu, cpuDifficulty]);

  const handleResetMatch = useCallback(() => {
    resetMatch();
    setGameMode("select");
    setIsCpu(false);
  }, [resetMatch]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(touch => {
      const relY = touch.clientY / window.innerHeight;
      if (relY > 0.5) {
        if (!p1TouchRef.current) {
          p1TouchRef.current = { id: touch.identifier, startX: touch.clientX, startY: touch.clientY };
        }
      } else {
        // In CPU mode, ignore touches on P2's side
        if (isCpu) return;
        if (!p2TouchRef.current) {
          p2TouchRef.current = { id: touch.identifier, startX: touch.clientX, startY: touch.clientY };
        }
      }
    });
  }, [p1TouchRef, p2TouchRef, isCpu]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(touch => {
      if (p1TouchRef.current?.id === touch.identifier) {
        const dx = touch.clientX - p1TouchRef.current.startX;
        const dy = touch.clientY - p1TouchRef.current.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 20) applyImpulse(1, dx * 0.3, dy * 0.3);
        p1TouchRef.current = null;
      }
      if (!isCpu && p2TouchRef.current?.id === touch.identifier) {
        const dx = touch.clientX - p2TouchRef.current.startX;
        const dy = touch.clientY - p2TouchRef.current.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 20) applyImpulse(2, dx * 0.3, dy * 0.3);
        p2TouchRef.current = null;
      }
    });
  }, [p1TouchRef, p2TouchRef, applyImpulse, isCpu]);

  const mouseStartRef = useRef<{ x: number; y: number; player: 1 | 2 } | null>(null);
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const relY = e.clientY / window.innerHeight;
    const player = relY > 0.5 ? 1 : 2;
    // In CPU mode, only allow P1 (bottom half)
    if (isCpu && player === 2) return;
    mouseStartRef.current = { x: e.clientX, y: e.clientY, player };
  }, [isCpu]);
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!mouseStartRef.current) return;
    const dx = e.clientX - mouseStartRef.current.x;
    const dy = e.clientY - mouseStartRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 20) applyImpulse(mouseStartRef.current.player, dx * 0.3, dy * 0.3);
    mouseStartRef.current = null;
  }, [applyImpulse]);

  const shareText = state.winner
    ? isCpu
      ? state.winner === 1
        ? "🤼 指相撲バトルYUBIZUMOでCPU（" + cpuDifficulty + "）に勝利！\n横綱の座を勝ち取った！\n#YUBIZUMO #指相撲 #物理ゲーム\nhttps://yubizumo.vercel.app"
        : "🤼 指相撲バトルYUBIZUMOでCPU（" + cpuDifficulty + "）に敗北...\nリベンジだ！\n#YUBIZUMO #指相撲 #物理ゲーム\nhttps://yubizumo.vercel.app"
      : "🤼 指相撲バトルYUBIZUMOで" + (state.winner === 1 ? "🔴赤" : "🔵青") + "が勝利！\n3本先取の熱闘を制した！\n#YUBIZUMO #指相撲 #物理ゲーム\nhttps://yubizumo.vercel.app"
    : "";
  const shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText);

  // Mode selection screen
  if (gameMode === "select") {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-4"
        style={{ background: "linear-gradient(160deg,#1a0505,#3d0f0f)" }}>
        <div className="text-7xl mb-4" style={{ filter: "drop-shadow(0 0 20px rgba(220,38,38,0.6))" }}>🤼</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: "#fca5a5" }}>指相撲バトル</h2>
        <p className="text-red-400 text-sm mb-8">モードを選んでください</p>

        <div className="space-y-4 w-full max-w-xs">
          <button onClick={() => setGameMode("difficulty")}
            className="w-full py-5 rounded-2xl font-black text-xl text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4c1d95)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
            <span className="text-3xl block mb-1">🤖</span>
            1人 vs CPU
            <span className="block text-xs font-normal mt-1 text-purple-200">コンピューターと対戦</span>
          </button>

          <button onClick={() => startGame(false)}
            className="w-full py-5 rounded-2xl font-black text-xl text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)", boxShadow: "0 0 24px rgba(220,38,38,0.4)" }}>
            <span className="text-3xl block mb-1">👥</span>
            2人対戦
            <span className="block text-xs font-normal mt-1 text-red-200">スマホを囲んで対戦</span>
          </button>
        </div>

        <a href="/" className="mt-8 text-red-600 text-sm underline">トップに戻る</a>
      </div>
    );
  }

  // Difficulty selection screen (CPU mode)
  if (gameMode === "difficulty") {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-4"
        style={{ background: "linear-gradient(160deg,#1a0505,#3d0f0f)" }}>
        <div className="text-6xl mb-3">🤖</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: "#fca5a5" }}>CPUの強さ</h2>
        <p className="text-red-400 text-sm mb-8">難易度を選んでください</p>

        <div className="space-y-3 w-full max-w-xs">
          {DIFFICULTY_OPTIONS.map(opt => (
            <button key={opt.key}
              onClick={() => startGame(true, opt.key)}
              className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-95"
              style={{ background: `linear-gradient(135deg,${opt.color},${opt.color}88)`, boxShadow: `0 0 20px ${opt.color}44` }}>
              {opt.label}
              <span className="block text-xs font-normal mt-1 opacity-80">{opt.desc}</span>
            </button>
          ))}
        </div>

        <button onClick={() => setGameMode("select")}
          className="mt-6 text-red-500 text-sm underline">
          戻る
        </button>
      </div>
    );
  }

  // Game screen
  return (
    <div className="flex flex-col items-center min-h-dvh"
      style={{ background: "linear-gradient(160deg,#1a0505,#3d0f0f)" }}>

      <div className="w-full max-w-sm flex items-center justify-between px-3 py-2">
        <button onClick={handleResetMatch} className="text-red-500 text-sm">← モード選択</button>
        <span className="font-black text-lg" style={{ color: "#fca5a5" }}>
          {isCpu ? "🤖 vs CPU" : "🤼 YUBIZUMO"}
        </span>
        <div className="text-sm text-red-400">
          {state.p1Score} - {state.p2Score}
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center py-1 text-xs font-bold"
          style={{ color: isCpu ? "#a78bfa" : "#60a5fa", transform: isCpu ? "none" : "rotate(180deg)" }}>
          {isCpu ? "🤖 CPU" : "🔵 P2 — ↑方向にスワイプで押す"}
        </div>
      </div>

      <div className="relative w-full max-w-sm flex-1 flex items-center justify-center px-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded-2xl"
          style={{ touchAction: "none", cursor: "crosshair", maxHeight: "75dvh", objectFit: "contain" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />

        {state.phase === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: "rgba(0,0,0,0.75)" }}>
            <div className="text-6xl mb-4">{isCpu ? "🤖" : "🤼"}</div>
            <div className="text-2xl font-black mb-2" style={{ color: "#fca5a5" }}>
              {isCpu ? "vs CPU（" + DIFFICULTY_OPTIONS.find(d => d.key === cpuDifficulty)?.label + "）" : "指相撲バトル"}
            </div>
            <p className="text-red-300 text-sm text-center px-8 mb-6">
              {isCpu
                ? "画面の下半分をスワイプして\nCPUを土俵の外に押し出せ！"
                : "2人でスマホを挑んで\n自分の側のエリアをスワイプ！"
              }
            </p>
            <button onClick={handleStartRound}
              className="px-12 py-3 rounded-xl font-black text-white text-lg transition-all active:scale-95"
              style={{ background: isCpu ? "linear-gradient(135deg,#7c3aed,#4c1d95)" : "linear-gradient(135deg,#dc2626,#7f1d1d)", boxShadow: isCpu ? "0 0 20px rgba(124,58,237,0.4)" : "0 0 20px rgba(220,38,38,0.4)" }}>
              対戦開始！
            </button>
          </div>
        )}

        {state.phase === "roundOver" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bounce-in"
            style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="text-5xl mb-3">{state.roundWinner === 1 ? "🔴" : isCpu ? "🤖" : "🔵"}</div>
            <div className="text-2xl font-black mb-1" style={{ color: state.roundWinner === 1 ? "#dc2626" : isCpu ? "#a78bfa" : "#3b82f6" }}>
              {isCpu
                ? (state.roundWinner === 1 ? "あなたの勝ち！" : "CPUの勝ち...")
                : (state.roundWinner === 1 ? "P1" : "P2") + " の勝ち！"
              }
            </div>
            <div className="text-white text-lg font-bold mb-4">
              {state.p1Score} - {state.p2Score}
            </div>
            <button onClick={handleStartRound}
              className="px-10 py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)" }}>
              次の一番 →
            </button>
          </div>
        )}

        {state.phase === "matchOver" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bounce-in"
            style={{ background: "rgba(0,0,0,0.85)" }}>
            <div className="text-6xl mb-3">{state.winner === 1 ? "🏆" : isCpu ? "😔" : "🏆"}</div>
            <div className="text-3xl font-black mb-1"
              style={{ color: state.winner === 1 ? "#dc2626" : isCpu ? "#a78bfa" : "#3b82f6" }}>
              {isCpu
                ? (state.winner === 1 ? "あなたの優勝！" : "CPUの勝ち...")
                : (state.winner === 1 ? "🔴 P1" : "🔵 P2") + " 優勝！"
              }
            </div>
            {state.winner === 1 && <div className="text-amber-300 text-lg mb-1 font-bold">横綱認定！</div>}
            {isCpu && state.winner === 2 && <div className="text-purple-300 text-sm mb-1">もう一度挑戦しよう！</div>}
            <div className="text-white text-xl font-black mb-5">
              {state.p1Score} - {state.p2Score}
            </div>
            <div className="space-y-2 w-48">
              <button onClick={handleStartRound}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)" }}>
                もう一度対戦
              </button>
              <button onClick={handleResetMatch}
                className="w-full py-2 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.1)", color: "#fca5a5" }}>
                モード選択に戻る
              </button>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-bold"
                style={{ background: "#000", color: "#fff" }}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Xでシェア
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm pb-2">
        <div className="text-center py-1 text-xs text-red-400 font-bold">
          🔴 {isCpu ? "あなた" : "P1"} — ↑方向にスワイプで押す
        </div>
      </div>
    </div>
  );
}
