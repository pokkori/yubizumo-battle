"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { useSumoPhysics, CpuDifficulty } from "@/hooks/useSumoPhysics";
import { useGameSounds } from "@/hooks/useGameSounds";
import { updateStreak, loadStreak, getStreakMilestoneMessage, type StreakData } from "@/lib/streak";

const CANVAS_W = 360;
const CANVAS_H = 560;

type GameMode = "select" | "difficulty" | "playing";

interface BattleStats {
  wins: number;
  losses: number;
  byDifficulty: Record<CpuDifficulty, { wins: number; losses: number }>;
}

const STATS_KEY = "yubizumo_stats";

function loadStats(): BattleStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {
    wins: 0, losses: 0,
    byDifficulty: {
      easy: { wins: 0, losses: 0 },
      normal: { wins: 0, losses: 0 },
      hard: { wins: 0, losses: 0 },
    },
  };
}

function saveStats(stats: BattleStats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch { /* ignore */ }
}

const CONFETTI_COLORS = ["#dc2626", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#fbbf24"];

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 1.5,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            background: p.color,
            borderRadius: "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

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
  const [stats, setStats] = useState<BattleStats | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  // Load stats on mount
  useEffect(() => {
    setStats(loadStats());
    setStreakData(loadStreak("yubizumo"));
  }, []);

  useEffect(() => {
    if (state.phase === "fighting") playStart();
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === "roundOver") playRoundWin();
    if (state.phase === "matchOver") {
      playMatchWin();
      // Record stats for CPU mode
      if (isCpu && state.winner) {
        setStats(prev => {
          const s = prev ? { ...prev } : loadStats();
          const won = state.winner === 1;
          if (won) { s.wins++; } else { s.losses++; }
          s.byDifficulty = { ...s.byDifficulty };
          s.byDifficulty[cpuDifficulty] = { ...s.byDifficulty[cpuDifficulty] };
          if (won) { s.byDifficulty[cpuDifficulty].wins++; } else { s.byDifficulty[cpuDifficulty].losses++; }
          saveStats(s);
          return s;
        });
      }
      // Show confetti on win
      if (state.winner === 1 || !isCpu) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      // Update streak on match end
      const updated = updateStreak("yubizumo");
      setStreakData(updated);
    }
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
    setShowConfetti(false);
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

  const diffLabel = DIFFICULTY_OPTIONS.find(d => d.key === cpuDifficulty)?.label ?? cpuDifficulty;

  const shareText = state.winner
    ? isCpu
      ? state.winner === 1
        ? "指相撲バトルYUBIZUMOでCPU（" + diffLabel + "）に勝利!\n横綱の座を勝ち取った!\n#YUBIZUMO #指相撲 #物理ゲーム\nhttps://yubizumo-battle.vercel.app"
        : "指相撲バトルYUBIZUMOでCPU（" + diffLabel + "）に敗北...\nリベンジだ!\n#YUBIZUMO #指相撲 #物理ゲーム\nhttps://yubizumo-battle.vercel.app"
      : "指相撲バトルYUBIZUMOで" + (state.winner === 1 ? "赤" : "青") + "が勝利!\n3本先取の熱闘を制した!\n#YUBIZUMO #指相撲 #物理ゲーム\nhttps://yubizumo-battle.vercel.app"
    : "";
  const shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText);

  const winRate = stats && (stats.wins + stats.losses) > 0
    ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
    : null;

  // Mode selection screen
  if (gameMode === "select") {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-4"
        style={{ background: "linear-gradient(160deg,#1a0505,#3d0f0f)" }}>
        <img src="/images/player1.png" alt="力士" className="w-24 h-24 mb-4 mx-auto" style={{ filter: "drop-shadow(0 0 20px rgba(220,38,38,0.6))" }} />
        <h2 className="text-3xl font-black mb-2" style={{ color: "#fca5a5" }}>指相撲バトル</h2>
        <p className="text-red-400 text-sm mb-8">モードを選んでください</p>

        <div className="space-y-4 w-full max-w-xs">
          <button onClick={() => setGameMode("difficulty")}
            className="w-full py-5 rounded-2xl font-black text-xl text-slate-100 transition-all active:scale-[0.97] min-h-[44px]"
            aria-label="1人でCPUと対戦するモードを選ぶ"
            style={{ background: "linear-gradient(135deg,#7c3aed,#4c1d95)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
            <img src="/images/cpu.png" alt="CPU" className="w-10 h-10 mx-auto mb-1" />
            1人 vs CPU
            <span className="block text-xs font-normal mt-1 text-purple-200">コンピューターと対戦</span>
          </button>

          <button onClick={() => startGame(false)}
            className="w-full py-5 rounded-2xl font-black text-xl text-slate-100 transition-all active:scale-[0.97] min-h-[44px]"
            aria-label="2人で対戦するモードを開始する"
            style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)", boxShadow: "0 0 24px rgba(220,38,38,0.4)" }}>
            <span className="flex justify-center gap-1 mb-1"><img src="/images/player1.png" alt="P1" className="w-8 h-8" /><img src="/images/player2.png" alt="P2" className="w-8 h-8" /></span>
            2人対戦
            <span className="block text-xs font-normal mt-1 text-red-200">スマホを囲んで対戦</span>
          </button>
        </div>

        {/* Streak display */}
        {streakData && streakData.count > 0 && (
          <div className="mt-4 px-4 py-2 rounded-xl w-full max-w-xs text-center"
            style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-slate-200 font-bold text-sm">{streakData.count}日連続プレイ中</p>
            {getStreakMilestoneMessage(streakData.count) && (
              <p className="text-yellow-400 text-xs mt-0.5">{getStreakMilestoneMessage(streakData.count)}</p>
            )}
          </div>
        )}

        {/* Stats display */}
        {stats && (stats.wins + stats.losses) > 0 && (
          <div className="mt-6 p-3 rounded-xl w-full max-w-xs text-center"
            style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="text-xs text-slate-300 mb-1">CPU対戦 通算成績</div>
            <div className="text-lg font-black text-white">
              {stats.wins}勝 {stats.losses}敗
              <span className="text-sm ml-2" style={{ color: winRate !== null && winRate >= 50 ? "#22c55e" : "#ef4444" }}>
                （勝率{winRate}%）
              </span>
            </div>
            <div className="flex justify-center gap-3 mt-1 text-xs">
              {(["easy", "normal", "hard"] as CpuDifficulty[]).map(d => {
                const dd = stats.byDifficulty[d];
                const total = dd.wins + dd.losses;
                if (total === 0) return null;
                return (
                  <span key={d} className="text-red-300">
                    {DIFFICULTY_OPTIONS.find(o => o.key === d)?.label}: {dd.wins}勝{dd.losses}敗
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <a href="/" className="mt-6 text-red-600 text-sm underline min-h-[44px] inline-flex items-center" aria-label="トップページに戻る">トップに戻る</a>
      </div>
    );
  }

  // Difficulty selection screen (CPU mode)
  if (gameMode === "difficulty") {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-4"
        style={{ background: "linear-gradient(160deg,#1a0505,#3d0f0f)" }}>
        <img src="/images/cpu.png" alt="CPU" className="w-20 h-20 mx-auto mb-3" />
        <h2 className="text-2xl font-black mb-2" style={{ color: "#fca5a5" }}>CPUの強さ</h2>
        <p className="text-red-400 text-sm mb-8">難易度を選んでください</p>

        <div className="space-y-3 w-full max-w-xs">
          {DIFFICULTY_OPTIONS.map(opt => {
            const dd = stats?.byDifficulty[opt.key];
            const total = dd ? dd.wins + dd.losses : 0;
            return (
              <button key={opt.key}
                onClick={() => startGame(true, opt.key)}
                className="w-full py-4 rounded-2xl font-black text-lg text-slate-100 transition-all active:scale-[0.97] min-h-[44px]"
                aria-label={`CPU難易度「${opt.label}」で対戦開始 — ${opt.desc}`}
                style={{ background: `linear-gradient(135deg,${opt.color},${opt.color}88)`, boxShadow: `0 0 20px ${opt.color}44` }}>
                {opt.label}
                <span className="block text-xs font-normal mt-1 opacity-80">{opt.desc}</span>
                {total > 0 && (
                  <span className="block text-xs font-normal mt-0.5 opacity-60">
                    戦績: {dd!.wins}勝{dd!.losses}敗
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button onClick={() => setGameMode("select")}
          className="mt-6 text-red-500 text-sm underline min-h-[44px] px-4"
          aria-label="モード選択画面に戻る">
          戻る
        </button>
      </div>
    );
  }

  // Game screen
  return (
    <div className="flex flex-col items-center min-h-dvh"
      style={{ background: "linear-gradient(160deg,#1a0505,#3d0f0f)" }}>

      {showConfetti && <Confetti />}

      <div className="w-full max-w-sm flex items-center justify-between px-3 py-2">
        <button onClick={handleResetMatch} className="text-red-500 text-sm min-h-[44px] px-2" aria-label="モード選択画面に戻る">← モード選択</button>
        <span className="font-black text-lg flex items-center gap-1" style={{ color: "#fca5a5" }}>
          {isCpu ? <><img src="/images/cpu.png" alt="" className="w-6 h-6 inline" /> vs CPU</> : <><img src="/images/player1.png" alt="" className="w-6 h-6 inline" /> YUBIZUMO</>}
        </span>
        <div className="text-sm text-red-400">
          {state.p1Score} - {state.p2Score}
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center py-1 text-xs font-bold"
          style={{ color: isCpu ? "#a78bfa" : "#60a5fa", transform: isCpu ? "none" : "rotate(180deg)" }}>
          {isCpu ? (
            <span className="inline-flex items-center gap-1">
              <img src="/images/cpu.png" alt="" className="w-5 h-5 inline" /> CPU（{diffLabel}）
              {state.phase === "fighting" && (
                <span className="cpu-think-bubble ml-1 text-purple-400"> ...考え中</span>
              )}
            </span>
          ) : <span className="inline-flex items-center gap-1"><img src="/images/player2.png" alt="" className="w-5 h-5 inline" /> P2 — ↑方向にスワイプで押す</span>}
        </div>
      </div>

      <div className="relative w-full max-w-sm flex-1 flex items-center justify-center px-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded-2xl"
          role="img"
          aria-label="指相撲バトルゲームキャンバス — スワイプして力士を操作する"
          style={{ touchAction: "none", cursor: "crosshair", maxHeight: "75dvh", objectFit: "contain" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />

        {state.phase === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)" }}>
            {isCpu ? <img src="/images/cpu.png" alt="" className="w-20 h-20 mx-auto mb-4" /> : <img src="/images/player1.png" alt="" className="w-20 h-20 mx-auto mb-4" />}
            <div className="text-2xl font-black mb-2 text-slate-100">
              {isCpu ? "vs CPU（" + diffLabel + "）" : "指相撲バトル"}
            </div>
            <p className="text-slate-300 text-sm text-center px-8 mb-6">
              {isCpu
                ? "画面の下半分をスワイプして\nCPUを土俵の外に押し出せ!"
                : "2人でスマホを囲んで\n自分の側のエリアをスワイプ!"
              }
            </p>
            <button onClick={handleStartRound}
              className="px-12 py-3 rounded-xl font-black text-slate-100 text-lg transition-all active:scale-[0.97] min-h-[44px]"
              aria-label="対戦を開始する"
              style={{ background: isCpu ? "linear-gradient(135deg,#7c3aed,#4c1d95)" : "linear-gradient(135deg,#dc2626,#7f1d1d)", boxShadow: isCpu ? "0 0 20px rgba(124,58,237,0.4)" : "0 0 20px rgba(220,38,38,0.4)" }}>
              対戦開始!</button>
          </div>
        )}

        {state.phase === "roundOver" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bounce-in"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)" }}>
            <img src={state.roundWinner === 1 ? "/images/player1.png" : isCpu ? "/images/cpu.png" : "/images/player2.png"} alt="" className="w-16 h-16 mx-auto mb-3" />
            <div className="text-2xl font-black mb-1" style={{ color: state.roundWinner === 1 ? "#dc2626" : isCpu ? "#a78bfa" : "#3b82f6" }}>
              {isCpu
                ? (state.roundWinner === 1 ? "あなたの勝ち!" : "CPUの勝ち...")
                : (state.roundWinner === 1 ? "P1" : "P2") + " の勝ち!"
              }
            </div>
            <div className="text-slate-100 text-lg font-bold mb-4">
              {state.p1Score} - {state.p2Score}
            </div>
            <button onClick={handleStartRound}
              className="px-10 py-3 rounded-xl font-bold text-slate-100 transition-all active:scale-[0.97] min-h-[44px]"
              aria-label="次の一番を開始する"
              style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)", boxShadow: "0 0 16px rgba(220,38,38,0.4)" }}>
              次の一番
            </button>
          </div>
        )}

        {state.phase === "matchOver" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bounce-in"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)" }}>
            {state.winner === 1
              ? <img src="/images/player1.png" alt="" className="w-20 h-20 mx-auto mb-3" style={{ filter: "drop-shadow(0 0 12px gold)" }} />
              : isCpu
                ? <img src="/images/cpu.png" alt="" className="w-20 h-20 mx-auto mb-3 opacity-60" />
                : <img src="/images/player2.png" alt="" className="w-20 h-20 mx-auto mb-3" style={{ filter: "drop-shadow(0 0 12px gold)" }} />
            }
            <div className="text-3xl font-black mb-1"
              style={{ color: state.winner === 1 ? "#dc2626" : isCpu ? "#a78bfa" : "#3b82f6" }}>
              {isCpu
                ? (state.winner === 1 ? "あなたの優勝!" : "CPUの勝ち...")
                : (state.winner === 1 ? "P1" : "P2") + " 優勝!"
              }
            </div>
            {state.winner === 1 && <div className="text-amber-300 text-lg mb-1 font-bold">横綱認定!</div>}
            {isCpu && state.winner === 2 && <div className="text-slate-300 text-sm mb-1">もう一度挑戦しよう!</div>}
            <div className="text-slate-100 text-xl font-black mb-2">
              {state.p1Score} - {state.p2Score}
            </div>

            {/* Stats on result screen */}
            {isCpu && stats && (stats.wins + stats.losses) > 0 && (
              <div className="text-xs text-red-300 mb-4">
                通算成績: {stats.wins}勝 {stats.losses}敗
                （勝率{Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%）
              </div>
            )}

            <div className="space-y-2 w-48">
              <button onClick={handleStartRound}
                className="w-full py-3 rounded-xl font-bold text-slate-100 text-sm transition-all active:scale-[0.97] min-h-[44px]"
                aria-label="もう一度対戦する"
                style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)", boxShadow: "0 0 16px rgba(220,38,38,0.4)" }}>
                もう一度対戦
              </button>
              <button onClick={handleResetMatch}
                className="w-full py-2 rounded-xl font-bold text-sm transition-all active:scale-[0.97] min-h-[44px]"
                aria-label="モード選択画面に戻る"
                style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", color: "#fca5a5" }}>
                モード選択に戻る
              </button>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                aria-label="Xで対戦結果をシェアする"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-bold min-h-[44px]"
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
          <span className="inline-flex items-center gap-1"><img src="/images/player1.png" alt="" className="w-4 h-4 inline" /> {isCpu ? "あなた" : "P1"} — ↑方向にスワイプで押す</span>
        </div>
      </div>
    </div>
  );
}
