import type { LabelType } from "@/lib/mock-data";

export interface VerdictOption {
  name: string;
  key: LabelType;
  color: string;
}

export const VERDICT_OPTIONS: VerdictOption[] = [
  { name: "Counterfeit", key: "counterfeit", color: "bg-destructive/100" },
  { name: "Suspicious", key: "suspicious", color: "bg-amber-500" },
  { name: "Legitimate", key: "legitimate", color: "bg-emerald-500" },
  { name: "Trademark Infringement", key: "trademark_infringement", color: "bg-orange-400" },
  { name: "Copyright Violation", key: "copyright_violation", color: "bg-purple-500" },
  { name: "Unlabeled", key: "unlabeled", color: "bg-accent0" },
];

export const VERDICT_TRIGGER_STYLE: Record<string, string> = {
  counterfeit: "bg-destructive hover:bg-destructive text-primary-foreground",
  suspicious: "bg-amber-500 hover:bg-amber-600 text-primary-foreground",
  legitimate: "bg-emerald-600 hover:bg-emerald-700 text-primary-foreground",
  trademark_infringement: "bg-orange-500 hover:bg-orange-600 text-primary-foreground",
  "trademark infringement": "bg-orange-500 hover:bg-orange-600 text-primary-foreground",
  copyright_violation: "bg-purple-600 hover:bg-purple-700 text-primary-foreground",
  unlabeled: "bg-muted-foreground hover:bg-foreground/80 text-primary-foreground",
};
