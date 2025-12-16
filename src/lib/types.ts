export interface Dimension {
  name: string;
  value: number;
}

export interface RadarProfile {
  id: string;
  name: string;
  dimensions: Dimension[];
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_DIMENSIONS: string[] = [
  "工程能力",
  "业务分析能力",
  "沟通能力",
  "主动性",
  "学习能力"
];

export const VALUE_LABELS: Record<number, string> = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5"
};
