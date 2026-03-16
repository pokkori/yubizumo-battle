"use client";

import { useRef, useCallback } from "react";
import { useSumoPhysics } from "@/hooks/useSumoPhysics";

const CANVAS_W = 360;
const CANVAS_H = 560;

export default function BattleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, initRound, applyImpulse, resetMatch, p1TouchRef, p2TouchRef } = useSumoPhysics(canvasRef);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(touch => {
      const relY = touch.clientY / window.innerHeight;
      if (relY > 0.5) {
        if (!p1TouchRef.current) {
          p1TouchRef.current = { id: touch.identifier, startX: touch.clientX, startY: touch.clientY };
        }
      } else {
        if (!p2TouchRef.current) {
          p2TouchRef.current = { id: touch.identifier, startX: touch.clientX, startY: touch.clientY };
        }
      }
    });
  }, [p1TouchRef, p2TouchRef]);

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
      if (p2TouchRef.current?.id === touch.identifier) {
        const dx = touch.clientX - p2TouchRef.current.startX;
        const dy = touch.clientY - p2TouchRef.current.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 20) applyImpulse(2, dx * 0.3, dy * 0.3);
        p2TouchRef.current = null;
      }
    });
  }, [p1TouchRef, p2TouchRef, applyImpulse]);

  const mouseStartRef = useRef<{ x: number; y: number; player: 1 | 2 } | null>(null);
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const relY = e.clientY / window.innerHeight;
    mouseStartRef.current = { x: e.clientX, y: e.clientY, player: relY > 0.5 ? 1 : 2 };
  }, []);
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!mouseStartRef.current) return;
    const dx = e.clientX - mouseStartRef.current.x;
    const dy = e.clientY - mouseStartRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 20) applyImpulse(mouseStartRef.current.player, dx * 0.3, dy * 0.3);
    mouseStartRef.current = null;
  }, [applyImpulse]);

  const shareText = state.winner
    ? "🤼 指相撲バトルYUBIZUMOで" + (state.winner === 1 ? "🔴赤" : "🔵青") + "が勝利！\n3本先取の熱闘を制した！\n#YUBIZUMO #指相撲 #物理ゲーム\nhttps://yubizumo.vercel.app"
    : "";
  const shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText);

  return (
    <div className="flex flex-col items-center min-h-dvh"
      style={{ background: "linear-gradient(160deg,#1a0505,#3d0f0f)" }}>

      <div className="w-full max-w-sm flex items-center justify-between px-3 py-2">
        <a href="/" className="text-red-500 text-sm">← トップ</a>
        <span className="font-black text-lg" style={{ color: "#fca5a5" }}>🤼 YUBIZUMO</span>
        <div className="text-sm text-red-400">
          {state.p1Score} - {state.p2Score}
        </div>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center py-1 text-xs text-blue-400 font-bold"
          style={{ transform: "rotate(180deg)" }}>
          🔵 P2 — ↑方向にスワイプで押す
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
            <div className="text-6xl mb-4">🤼</div>
            <div className="text-2xl font-black mb-2" style={{ color: "#fca5a5" }}>
              指相撲バトル
            </div>
            <p className="text-red-300 text-sm text-center px-8 mb-6">
              2人でスマホを挑んで<br />
              自分の側のエリアをスワイプ！
            </p>
            <button onClick={initRound}
              className="px-12 py-3 rounded-xl font-black text-white text-lg transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)", boxShadow: "0 0 20px rgba(220,38,38,0.4)" }}>
              対戦開始！
            </button>
          </div>
        )}

        {state.phase === "roundOver" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bounce-in"
            style={{ background: "rgba(0,0,0,0.8)" }}>
            <div className="text-5xl mb-3">{state.roundWinner === 1 ? "🔴" : "🔵"}</div>
            <div className="text-2xl font-black mb-1" style={{ color: state.roundWinner === 1 ? "#dc2626" : "#3b82f6" }}>
              {state.roundWinner === 1 ? "P1" : "P2"} の勝ち！
            </div>
            <div className="text-white text-lg font-bold mb-4">
              {state.p1Score} - {state.p2Score}
            </div>
            <button onClick={initRound}
              className="px-10 py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)" }}>
              次の一番 →
            </button>
          </div>
        )}

        {state.phase === "matchOver" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bounce-in"
            style={{ background: "rgba(0,0,0,0.85)" }}>
            <div className="text-6xl mb-3">🏆</div>
            <div className="text-3xl font-black mb-1"
              style={{ color: state.winner === 1 ? "#dc2626" : "#3b82f6" }}>
              {state.winner === 1 ? "🔴 P1" : "🔵 P2"} 優勝！
            </div>
            <div className="text-amber-300 text-lg mb-1 font-bold">横綱認定！</div>
            <div className="text-white text-xl font-black mb-5">
              {state.p1Score} - {state.p2Score}
            </div>
            <div className="space-y-2 w-48">
              <button onClick={resetMatch}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)" }}>
                もう一度対戦
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
          🔴 P1 — ↑方向にスワイプで押す
        </div>
      </div>
    </div>
  );
}
