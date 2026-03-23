import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://yubizumo.vercel.app";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>;
}
