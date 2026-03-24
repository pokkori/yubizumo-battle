export interface Wrestler {
  id: string;
  name: string;
  emoji: string;
  color: string;
  weight: number;   // kg換算（物理質量に使用）
  rank: string;
}

export const WRESTLERS: Wrestler[] = [
  { id: "p1", name: "赤力士", emoji: "", color: "#dc2626", weight: 120, rank: "横綱" },
  { id: "p2", name: "青力士", emoji: "", color: "#2563eb", weight: 120, rank: "横綱" },
];

export const RANKS = ["前頭", "小結", "関脇", "大関", "横綱"];
