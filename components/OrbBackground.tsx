"use client";
import React, { memo } from "react";

const ORBS = [
  { w: 220, h: 220, top: "5%",  left: "-8%",  color: "rgba(220,38,38,0.12)",  dur: 14, delay: 0 },
  { w: 160, h: 160, top: "60%", left: "70%",  color: "rgba(124,58,237,0.10)", dur: 18, delay: 3 },
  { w: 130, h: 130, top: "30%", left: "55%",  color: "rgba(220,38,38,0.08)",  dur: 12, delay: 7 },
  { w: 90,  h: 90,  top: "80%", left: "10%",  color: "rgba(251,191,36,0.08)", dur: 20, delay: 1 },
  { w: 180, h: 180, top: "20%", left: "80%",  color: "rgba(239,68,68,0.06)",  dur: 16, delay: 5 },
  { w: 100, h: 100, top: "70%", left: "40%",  color: "rgba(167,139,250,0.07)",dur: 11, delay: 9 },
  { w: 70,  h: 70,  top: "45%", left: "5%",   color: "rgba(251,191,36,0.06)", dur: 22, delay: 2 },
  { w: 120, h: 120, top: "90%", left: "80%",  color: "rgba(220,38,38,0.07)",  dur: 15, delay: 6 },
];

function OrbBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        pointerEvents: "none", overflow: "hidden",
      }}
    >
      {ORBS.map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: orb.w, height: orb.h,
            top: orb.top, left: orb.left,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            filter: "blur(32px)",
            animation: `orbFloat ${orb.dur}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-24px) scale(1.08); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default memo(OrbBackground);
