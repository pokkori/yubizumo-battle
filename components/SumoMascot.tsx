"use client";
import React, { memo, useEffect, useState } from "react";

type Pose = "idle" | "win" | "lose" | "ready";

interface Props {
  pose?: Pose;
  size?: number;
  style?: React.CSSProperties;
}

function SumoMascot({ pose = "idle", size = 96, style }: Props) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (pose !== "idle") return;
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3800);
    return () => clearInterval(t);
  }, [pose]);

  const eyeScaleY = blink ? 0.1 : 1;

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        animation: pose === "idle"
          ? "sumoBreath 3s ease-in-out infinite"
          : pose === "win"
            ? "sumoWin 0.6s ease-out forwards"
            : pose === "lose"
              ? "sumoLose 0.5s ease-in-out"
              : "sumoReady 0.4s ease-out forwards",
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* まわし（廻し）*/}
        <ellipse cx="50" cy="78" rx="28" ry="12" fill="#1e1b4b" />
        <rect x="32" y="68" width="36" height="14" rx="4" fill="#312e81" />
        <rect x="40" y="70" width="20" height="3" rx="1.5" fill="#fbbf24" />

        {/* 体 */}
        <ellipse cx="50" cy="62" rx="26" ry="22" fill="#f5c99a" />

        {/* 腕（左）*/}
        <ellipse cx="24" cy="62" rx="8" ry="12" fill="#f5c99a"
          transform={pose === "win" ? "rotate(-30,24,62)" : pose === "ready" ? "rotate(20,24,62)" : ""} />
        {/* 腕（右）*/}
        <ellipse cx="76" cy="62" rx="8" ry="12" fill="#f5c99a"
          transform={pose === "win" ? "rotate(30,76,62)" : pose === "ready" ? "rotate(-20,76,62)" : ""} />

        {/* 頭 */}
        <circle cx="50" cy="38" r="22" fill="#f5c99a" />

        {/* まげ */}
        <ellipse cx="50" cy="18" rx="7" ry="3" fill="#1a1a1a" />
        <rect x="47" y="15" width="6" height="10" rx="3" fill="#1a1a1a" />

        {/* 眉 */}
        {pose === "lose"
          ? <>
              <path d="M36 30 Q40 27 44 30" stroke="#4b2900" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M56 30 Q60 27 64 30" stroke="#4b2900" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          : <>
              <path d="M36 30 Q40 33 44 30" stroke="#4b2900" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M56 30 Q60 33 64 30" stroke="#4b2900" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
        }

        {/* 目 */}
        <ellipse cx="42" cy="38" rx="4" ry={eyeScaleY * 4} fill="#1a1a1a" />
        <ellipse cx="58" cy="38" rx="4" ry={eyeScaleY * 4} fill="#1a1a1a" />
        {/* 目の輝き */}
        {!blink && <>
          <circle cx="43.5" cy="36.5" r="1.2" fill="#fff" />
          <circle cx="59.5" cy="36.5" r="1.2" fill="#fff" />
        </>}

        {/* 口 */}
        {pose === "lose"
          ? <path d="M43 47 Q50 44 57 47" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" fill="none" />
          : pose === "win"
            ? <path d="M43 46 Q50 52 57 46" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" fill="none" />
            : <path d="M44 47 Q50 50 56 47" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" fill="none" />
        }

        {/* 勝利時の汗エフェクト */}
        {pose === "win" && <>
          <circle cx="30" cy="30" r="3" fill="#60a5fa" opacity="0.7" />
          <circle cx="72" cy="28" r="2" fill="#60a5fa" opacity="0.6" />
        </>}

        {/* 負け時の涙 */}
        {pose === "lose" && <>
          <path d="M40 44 Q39 50 40 54" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M60 44 Q61 50 60 54" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
        </>}

        {/* ready時のオーラ */}
        {pose === "ready" && <>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#dc2626" strokeWidth="2" opacity="0.3" strokeDasharray="8 6" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.2" />
        </>}
      </svg>

      <style>{`
        @keyframes sumoBreath {
          0%,100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.04) translateY(-3px); }
        }
        @keyframes sumoWin {
          0% { transform: scale(0.8) rotate(-5deg); }
          50% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes sumoLose {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-6px) rotate(-3deg); }
          75% { transform: translateX(6px) rotate(3deg); }
        }
        @keyframes sumoReady {
          0% { transform: scale(0.9) translateY(5px); }
          100% { transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default memo(SumoMascot);
