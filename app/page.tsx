"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #1a0505 0%, #3d0f0f 50%, #1a0505 100%)" }}>

      {/* NEW: CPU mode banner */}
      <div className="w-full max-w-xs mb-6 p-3 rounded-xl text-center"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(124,58,237,0.1))", border: "1px solid rgba(124,58,237,0.4)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <img src="/images/cpu.png" alt="" className="w-6 h-6 inline" />
        <span className="text-purple-300 text-sm font-bold ml-2">NEW! CPU対戦モード追加</span>
        <p className="text-purple-400 text-xs mt-1">1人でも楽しめるようになりました！</p>
      </div>

      <div className="text-center mb-8 p-6 rounded-3xl"
        style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.18)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <img src="/images/player1.png" alt="力士" className="w-28 h-28 mx-auto mb-3" style={{ filter: "drop-shadow(0 0 24px rgba(220,38,38,0.7))" }} />
        <h1 className="text-4xl font-black mb-1"
          style={{ color: "#fca5a5", textShadow: "0 0 20px rgba(220,38,38,0.6)" }}>
          指相撲バトル
        </h1>
        <p className="text-red-300 text-lg font-bold mb-1">YUBIZUMO</p>
        <p className="text-red-600 text-sm">1人でも2人でも！指1本で物理相撲バトル</p>
      </div>

      {streak > 1 && (
        <div className="text-center text-sm text-orange-400 mb-4 px-4 py-2 rounded-full"
          style={{ background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
          {streak}日連続プレイ中!
        </div>
      )}

      <Link href="/game"
        className="inline-block px-14 py-4 rounded-2xl text-xl font-black mb-8 transition-all active:scale-95 min-h-[44px]"
        aria-label="指相撲バトルゲームを開始する"
        style={{
          background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
          color: "#fff",
          boxShadow: "0 0 30px rgba(220,38,38,0.5)",
        }}>
        対戦スタート 
      </Link>

      <div className="w-full max-w-xs space-y-3">
        {[
          { icon: "", title: "1人でCPU対戦", desc: "難易度3段階！よわい・ふつう・つよい" },
          { icon: "", title: "2人でスマホを囲む", desc: "左右に向き合って画面を持つ" },
          { icon: "", title: "自分の力士をスワイプ", desc: "画面の自分側エリアをフリックで操作" },
          { icon: "", title: "相手を俵の外に押し出す", desc: "土俵から出たら負け！3本先取" },
          { icon: "", title: "勝者はXでシェア", desc: "「横綱に勝った！」を友達に自慢" },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 items-center p-3 rounded-xl"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="font-bold text-red-200 text-sm">{item.title}</div>
              <div className="text-xs text-red-500">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <footer className="mt-10 text-center text-xs text-red-900 pb-6 w-full max-w-xs px-4 py-4 rounded-2xl"
        style={{ background: "rgba(220,38,38,0.05)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
        <p>&copy; 2026 ポッコリラボ</p>
        <p className="mt-1">
          <a href="https://twitter.com/levona_design" className="underline hover:text-red-700" aria-label="Xでお問い合わせ（@levona_design）">お問い合わせ: X @levona_design</a>
        </p>
        <div className="mt-2 space-x-4">
          <a href="/privacy" aria-label="プライバシーポリシーを見る" className="underline hover:text-red-700" >プライバシーポリシー</a>
          <a href="/legal" aria-label="特定商取引法に基づく表示" className="underline hover:text-red-700" >特商法表記</a>
        </div>
      </footer>
    </div>
  );
}
