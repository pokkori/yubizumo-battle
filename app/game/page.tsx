"use client";

import dynamic from "next/dynamic";

const BattleGame = dynamic(() => import("@/components/BattleGame"), { ssr: false });

export default function GamePage() {
  return <BattleGame />;
}
