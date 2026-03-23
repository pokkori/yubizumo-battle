import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #1a0505 0%, #3d0f0f 50%, #1a0505 100%)" }}>

      {/* NEW: CPU mode banner */}
      <div className="w-full max-w-xs mb-6 p-3 rounded-xl text-center"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(124,58,237,0.1))", border: "1px solid rgba(124,58,237,0.4)" }}>
        <img src="/images/cpu.png" alt="" className="w-6 h-6 inline" />
        <span className="text-purple-300 text-sm font-bold ml-2">NEW! CPU対戦モード追加</span>
        <p className="text-purple-400 text-xs mt-1">1人でも楽しめるようになりました！</p>
      </div>

      <div className="text-center mb-8">
        <img src="/images/player1.png" alt="力士" className="w-28 h-28 mx-auto mb-3" style={{ filter: "drop-shadow(0 0 24px rgba(220,38,38,0.7))" }} />
        <h1 className="text-4xl font-black mb-1"
          style={{ color: "#fca5a5", textShadow: "0 0 20px rgba(220,38,38,0.6)" }}>
          指相撲バトル
        </h1>
        <p className="text-red-300 text-lg font-bold mb-1">YUBIZUMO</p>
        <p className="text-red-600 text-sm">1人でも2人でも！指1本で物理相撲バトル</p>
      </div>

      <Link href="/game"
        className="inline-block px-14 py-4 rounded-2xl text-xl font-black mb-8 transition-all active:scale-95 min-h-[44px]"
        aria-label="指相撲バトルゲームを開始する"
        style={{
          background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
          color: "#fff",
          boxShadow: "0 0 30px rgba(220,38,38,0.5)",
        }}>
        対戦スタート 🤼
      </Link>

      <div className="w-full max-w-xs space-y-3">
        {[
          { icon: "🤖", title: "1人でCPU対戦", desc: "難易度3段階！よわい・ふつう・つよい" },
          { icon: "👥", title: "2人でスマホを囲む", desc: "左右に向き合って画面を持つ" },
          { icon: "👆", title: "自分の力士をスワイプ", desc: "画面の自分側エリアをフリックで操作" },
          { icon: "⚡", title: "相手を俵の外に押し出す", desc: "土俵から出たら負け！3本先取" },
          { icon: "📤", title: "勝者はXでシェア", desc: "「横綱に勝った！」を友達に自慢" },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 items-center p-3 rounded-xl"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)" }}>
            <span className="text-2xl">{item.icon}</span>
            <div>
              <div className="font-bold text-red-200 text-sm">{item.title}</div>
              <div className="text-xs text-red-500">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <footer className="mt-10 text-center text-xs text-red-900 pb-6">
        <p>&copy; 2026 ポッコリラボ</p>
        <p className="mt-1">
          <a href="https://twitter.com/levona_design" className="underline hover:text-red-700" aria-label="Xでお問い合わせ（@levona_design）">お問い合わせ: X @levona_design</a>
        </p>
      </footer>
    </div>
  );
}
