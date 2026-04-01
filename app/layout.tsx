import type { Metadata } from "next";
import { GoogleAdScript } from "@/components/GoogleAdScript";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const SITE_URL = "https://yubizumo-battle.vercel.app";

export const metadata: Metadata = {
  title: "指相撲バトル YUBIZUMO | 1人でもCPU対戦・2人対戦の物理相撲",
  description: "1人でもCPU対戦OK！2人でスマホを囲んで指1本で相撲バトル。Matter.js物理演算で本格的な押し出し対決。難易度3段階のCPUモード搭載。横綱を目指せ！",
  keywords: ["指相撲", "物理ゲーム", "CPU対戦", "ブラウザゲーム", "無料ゲーム", "2人ゲーム"],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "指相撲バトル YUBIZUMO | CPU対戦モード搭載",
    description: "1人でもCPU対戦OK！指1本で物理相撲バトル。横綱を目指せ！",
    type: "website",
    url: SITE_URL,
    siteName: "指相撲バトル YUBIZUMO",
    locale: "ja_JP",
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "指相撲バトル YUBIZUMO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "指相撲バトル YUBIZUMO",
    description: "1人でもCPU対戦OK！指1本で物理相撲バトル。横綱を目指せ！",
    images: [`${SITE_URL}/og.png`],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "指相撲バトル",
  "description": "スマホで2人対戦する指相撲ゲーム",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Web",
  "url": "https://yubizumo-battle.vercel.app",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" },
  "genre": "Action Game"
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "指相撲バトルは何人で遊べますか？", "acceptedAnswer": { "@type": "Answer", "text": "1人でCPUと対戦するモードと、同じデバイスで2人が同時に対戦するモードの2種類があります。" } },
    { "@type": "Question", "name": "スマートフォンだけで遊べますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい、スマートフォン・タブレット・PCのブラウザで遊べます。アプリのインストールは不要です。" } },
    { "@type": "Question", "name": "CPU対戦の難易度は選べますか？", "acceptedAnswer": { "@type": "Answer", "text": "やさしい・ふつう・つよいの3段階から選択できます。" } },
    { "@type": "Question", "name": "勝ち負けはどうやって決まりますか？", "acceptedAnswer": { "@type": "Answer", "text": "制限時間内に相手の指を押し込んだ回数が多い方が勝ちです。" } },
    { "@type": "Question", "name": "スコアは保存されますか？", "acceptedAnswer": { "@type": "Answer", "text": "ベストスコアはブラウザのローカルストレージに保存されます。" } },
    { "@type": "Question", "name": "BGMはオフにできますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい、画面上の音符アイコンをタップするとBGMのオン/オフを切り替えられます。" } },
    { "@type": "Question", "name": "子供でも遊べますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい、6歳以上のお子様でも楽しめるシンプルな操作設計です。" } },
    { "@type": "Question", "name": "スコアをSNSでシェアできますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい、勝利後にXへスコアをシェアするボタンが表示されます。" } },
    { "@type": "Question", "name": "オフラインでも遊べますか？", "acceptedAnswer": { "@type": "Answer", "text": "初回読み込み後はオフラインでもプレイ可能です。" } },
    { "@type": "Question", "name": "ゲームは無料ですか？", "acceptedAnswer": { "@type": "Answer", "text": "基本プレイは完全無料です。広告表示により運営しています。" } }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      </head>
      <body>
        {children}
        <GoogleAdScript />
        <SpeedInsights />
        <footer style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#888' }}>
          <a href="/legal" style={{ color: '#aaa', marginRight: '12px' }}>特定商取引法に基づく表記</a>
          <a href="/privacy" style={{ color: '#aaa', marginRight: '12px' }}>プライバシーポリシー</a>
          <a href="/terms" style={{ color: '#aaa' }}>利用規約</a>
        </footer>
      </body>
    </html>
  );
}
