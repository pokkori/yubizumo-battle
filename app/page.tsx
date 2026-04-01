"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AdBanner } from "@/components/AdBanner";

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {[
        { size: 5, x: 15, y: 20, dur: 9, delay: 0, color: "rgba(220,38,38,0.25)" },
        { size: 7, x: 75, y: 12, dur: 12, delay: 1.5, color: "rgba(252,165,165,0.18)" },
        { size: 4, x: 40, y: 65, dur: 10, delay: 2.5, color: "rgba(220,38,38,0.20)" },
        { size: 6, x: 88, y: 50, dur: 11, delay: 3, color: "rgba(252,165,165,0.15)" },
        { size: 3, x: 25, y: 82, dur: 8, delay: 4, color: "rgba(220,38,38,0.22)" },
        { size: 5, x: 55, y: 32, dur: 14, delay: 5, color: "rgba(124,58,237,0.15)" },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            left: `${p.x}%`, top: `${p.y}%`,
            backgroundColor: p.color,
            animation: `floatYubi ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
            filter: "blur(1px)",
          }}
        />
      ))}
      <style>{`
        @keyframes floatYubi {
          0% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { opacity: 1; }
          100% { transform: translateY(-25px) translateX(12px); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

/* SVG Sumo/Rikishi icon */
function RikishiSVG() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="rikishiGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fca5a5" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
        <filter id="rikishiGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* body */}
      <ellipse cx="50" cy="65" rx="30" ry="25" fill="url(#rikishiGrad)" filter="url(#rikishiGlow)" />
      {/* head */}
      <circle cx="50" cy="32" r="18" fill="#fca5a5" />
      {/* hair knot (mage) */}
      <ellipse cx="50" cy="18" rx="8" ry="6" fill="#7f1d1d" />
      {/* eyes */}
      <circle cx="44" cy="32" r="2.5" fill="#1a0505" />
      <circle cx="56" cy="32" r="2.5" fill="#1a0505" />
      {/* mouth */}
      <path d="M45 38 Q50 42 55 38" stroke="#7f1d1d" strokeWidth="1.5" fill="none" />
      {/* mawashi belt */}
      <path d="M25 68 Q50 78 75 68" stroke="#fcd34d" strokeWidth="4" fill="none" />
      {/* arms */}
      <path d="M22 55 L12 48" stroke="#fca5a5" strokeWidth="6" strokeLinecap="round" />
      <path d="M78 55 L88 48" stroke="#fca5a5" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/* Step icons */
const StepIcons = [
  <svg key="y1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg>,
  <svg key="y2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  <svg key="y3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="4,14 10,14 10,20"/><polyline points="20,10 14,10 14,4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>,
  <svg key="y4" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.5 14L19 21H5l3.5-7"/></svg>,
  <svg key="y5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
];

export default function HomePage() {
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('yubizumo_streak') || '{"count":0,"last":""}');
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (data.last === today) setStreak(data.count);
    else if (data.last === yesterday) {
      const updated = { count: data.count + 1, last: today };
      localStorage.setItem('yubizumo_streak', JSON.stringify(updated));
      setStreak(updated.count);
    } else {
      const updated = { count: 1, last: today };
      localStorage.setItem('yubizumo_streak', JSON.stringify(updated));
      setStreak(1);
    }
  }, []);
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-4 py-10 relative"
      style={{
        background: "radial-gradient(ellipse at 20% 50%, rgba(220,38,38,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(252,165,165,0.08) 0%, transparent 50%), #0F0F1A",
      }}
    >
      <FloatingParticles />

      <div className="relative z-10 flex flex-col items-center w-full max-w-xs">
        {/* NEW CPU banner */}
        <div
          className="w-full mb-6 p-3 rounded-xl text-center"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))",
            border: "1px solid rgba(124,58,237,0.25)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" className="inline -mt-0.5 mr-1" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <rect x="9" y="9" width="6" height="6" />
            <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
            <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
            <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" />
            <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" />
          </svg>
          <span className="text-purple-300 text-sm font-bold">NEW! CPU対戦モード追加</span>
          <p className="text-purple-400/70 text-xs mt-1">1人でも楽しめるようになりました!</p>
        </div>

        {/* Hero */}
        <div
          className="text-center mb-8 p-8 w-full"
          style={{
            background: "rgba(220,38,38,0.06)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(220,38,38,0.15)",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(220,38,38,0.08)",
          }}
        >
          <div className="flex justify-center mb-3">
            <RikishiSVG />
          </div>
          <h1
            className="text-4xl font-black mb-1"
            style={{
              background: "linear-gradient(135deg, #fca5a5 0%, #ef4444 50%, #dc2626 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(220,38,38,0.3))",
            }}
          >
            指相撲バトル
          </h1>
          <p className="text-red-300/80 text-lg font-bold mb-1">YUBIZUMO</p>
          <p className="text-red-500/60 text-sm">1人でも2人でも! 指1本で物理相撲バトル</p>
        </div>

        {streak > 1 && (
          <div
            className="text-center text-sm text-orange-300 mb-4 px-5 py-2 rounded-full font-bold"
            style={{
              background: "rgba(251,146,60,0.1)",
              border: "1px solid rgba(251,146,60,0.25)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline mr-1 -mt-0.5" aria-hidden="true">
              <path d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z" fill="#fb923c" />
            </svg>
            {streak}日連続プレイ中!
          </div>
        )}

        {/* CTA */}
        <Link
          href="/game"
          className="inline-block px-14 py-4 rounded-2xl text-xl font-black mb-8 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] min-h-[52px]"
          aria-label="指相撲バトルゲームを開始する"
          style={{
            background: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
            color: "#fff",
            boxShadow: "0 0 30px rgba(220,38,38,0.4), 0 4px 20px rgba(0,0,0,0.3)",
            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          対戦スタート
        </Link>

        {/* How to play */}
        <div className="w-full space-y-3">
          {[
            { title: "1人でCPU対戦", desc: "難易度3段階! よわい・ふつう・つよい" },
            { title: "2人でスマホを囲む", desc: "左右に向き合って画面を持つ" },
            { title: "自分の力士をスワイプ", desc: "画面の自分側エリアをフリックで操作" },
            { title: "相手を俵の外に押し出す", desc: "土俵から出たら負け! 3本先取" },
            { title: "勝者はXでシェア", desc: "「横綱に勝った!」を友達に自慢" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-3 items-center p-4"
              style={{
                background: "rgba(220,38,38,0.06)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(220,38,38,0.12)",
                borderRadius: "16px",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(220,38,38,0.12)" }}>
                {StepIcons[i]}
              </div>
              <div>
                <div className="font-bold text-red-200 text-sm">{item.title}</div>
                <div className="text-xs text-red-500/60">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Ad Banner */}
        <AdBanner slot="0000000000" />

        {/* Footer */}
        <footer
          className="mt-10 text-center text-xs text-red-600/40 pb-6 w-full px-4 py-5"
          style={{
            background: "rgba(220,38,38,0.03)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "16px",
            border: "1px solid rgba(220,38,38,0.06)",
          }}
        >
          <p>&copy; 2026 ポッコリラボ</p>
          <p className="mt-1">
            <a href="https://twitter.com/levona_design" className="underline hover:text-red-400 transition-colors" aria-label="Xでお問い合わせ（@levona_design）">お問い合わせ: X @levona_design</a>
          </p>
          <div className="mt-2 space-x-4">
            <a href="/privacy" aria-label="プライバシーポリシーを見る" className="underline hover:text-red-400 transition-colors">プライバシーポリシー</a>
            <a href="/legal" aria-label="特定商取引法に基づく表示" className="underline hover:text-red-400 transition-colors">特商法表記</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
