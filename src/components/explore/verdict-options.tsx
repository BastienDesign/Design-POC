import type { LabelType } from "@/lib/mock-data";

export interface VerdictOption {
  name: string;
  key: LabelType;
  color: string;
}

export const VERDICT_OPTIONS: VerdictOption[] = [
  { name: "Counterfeit", key: "counterfeit", color: "bg-red-500" },
  { name: "Suspicious", key: "suspicious", color: "bg-amber-500" },
  { name: "Legitimate", key: "legitimate", color: "bg-emerald-500" },
  { name: "Trademark Infringement", key: "trademark infringement", color: "bg-orange-400" },
  { name: "Unlabeled", key: "unlabeled", color: "bg-neutral-500" },
];

export const VERDICT_TRIGGER_STYLE: Record<string, string> = {
  counterfeit: "bg-red-600 hover:bg-red-700 text-white",
  suspicious: "bg-amber-500 hover:bg-amber-600 text-white",
  legitimate: "bg-emerald-600 hover:bg-emerald-700 text-white",
  "trademark infringement": "bg-orange-500 hover:bg-orange-600 text-white",
  unlabeled: "bg-neutral-600 hover:bg-neutral-700 text-white",
};
