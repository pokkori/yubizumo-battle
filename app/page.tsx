import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #1a0505 0%, #3d0f0f 50%, #1a0505 100%)" }}>

      <div className="text-center mb-8">
        <div className="text-8xl mb-3" style={{ filter: "drop-shadow(0 0 24px rgba(220,38,38,0.7))" }}>🤼</div>
        <h1 className="text-4xl font-black mb-1"
          style={{ color: "#fca5a5", textShadow: "0 0 20px rgba(220,38,38,0.6)" }}>
          指相撲バトル
        </h1>
        <p className="text-red-300 text-lg font-bold mb-1">YUBIZUMO</p>
        <p className="text-red-600 text-sm">2人でスマホを囲んで指1本で戦え！</p>
      </div>

      <Link href="/game"
        className="inline-block px-14 py-4 rounded-2xl text-xl font-black mb-8 transition-all active:scale-95"
        style={{
          background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
          color: "#fff",
          boxShadow: "0 0 30px rgba(220,38,38,0.5)",
        }}>
        対戦スタート 🤼
      </Link>

      <div className="w-full max-w-xs space-y-3">
        {[
          { icon: "📱", title: "2人でスマホを囲む", desc: "左右に向き合って画面を持つ" },
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
    </div>
  );
}
