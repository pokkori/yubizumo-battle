import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🤼 指相撲バトル YUBIZUMO | 2人対戦物理相撲",
  description: "スマホを2人で囲んで指1本で相撲対戦！Matter.js物理演算で本格的な押し出しバトル。横綱を目指せ！",
  openGraph: {
    title: "🤼 指相撲バトル YUBIZUMO",
    description: "2人でスマホを囲んで指1本で対戦！横綱を目指せ！",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>;
}
