"use client";

import { useState, useMemo } from "react";
import {
  RiGlobalLine,
  RiFileTextLine,
  RiPulseLine,
  RiMoreLine,
  RiArrowDownSLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiInformationLine,
  RiTimeLine,
  RiNodeTree,
  RiMessage3Line,
  RiExternalLinkLine,
  RiSearchLine,
  RiCheckboxMultipleLine,
  RiPriceTag3Line,
  RiGroupLine,
  RiShieldCheckLine,
  RiAlertFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiSettings3Line,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ImageWithFallback } from "@/components/explore/image-with-fallback";
import { useRouter } from "next/navigation";
import { NetworkTab, type NetworkEntity } from "@/components/moderation/network-tab";

/* ─── Risk Tile Types & Styling ─── */

type RiskLevel = "high" | "medium" | "low";

interface RiskTile {
  key: string;
  level: RiskLevel;
  label: string;
  desc: string;
  icon: typeof RiAlertFill;
  fields?: string[];
}

const RISK_TILE_STYLES: Record<RiskLevel, { bg: string; border: string; icon: string; label: string; desc: string }> = {
  high: { bg: "bg-destructive/10", border: "border-red-100", icon: "text-destructive", label: "text-red-800", desc: "text-red-900" },
  medium: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600", label: "text-amber-800", desc: "text-amber-900" },
  low: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600", label: "text-emerald-800", desc: "text-emerald-900" },
};

const RISK_VALUE_STYLES: Record<RiskLevel, string> = {
  high: "font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded w-fit border border-red-100",
  medium: "font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit border border-orange-100",
  low: "font-medium text-foreground",
};

const INSIGHT_SIGNALS = [
  { id: "repeatOffender", label: "Repeat Offender", desc: "Account has been flagged multiple times." },
  { id: "highInfringement", label: "High Infringement", desc: "Infringement rate exceeds threshold." },
  { id: "highVolume", label: "High Volume Seller", desc: "Unusually high number of posts." },
  { id: "suspiciousGeo", label: "Suspicious Geo", desc: "Geo mismatch with platform region." },
  { id: "lowModeration", label: "Low Moderation", desc: "Very few posts have been moderated." },
  { id: "clusterLinked", label: "Cluster Linked", desc: "Account is part of a known cluster." },
] as const;

type InsightPrefKey = (typeof INSIGHT_SIGNALS)[number]["id"];

const DEFAULT_INSIGHT_PREFS: Record<InsightPrefKey, boolean> = {
  repeatOffender: true,
  highInfringement: true,
  highVolume: true,
  suspiciousGeo: true,
  lowModeration: true,
  clusterLinked: true,
};

function computeAccountRiskTiles(account: AccountData): RiskTile[] {
  const tiles: RiskTile[] = [];

  if (account.infringementPct >= 80) {
    tiles.push({ key: "highInfringement", level: "high", label: "High Infringement", desc: `${account.infringementPct}% infringement rate`, icon: RiAlertFill, fields: ["Infringement Rate"] });
  } else if (account.infringementPct >= 50) {
    tiles.push({ key: "highInfringement", level: "medium", label: "Elevated Infringement", desc: `${account.infringementPct}% infringement rate`, icon: RiErrorWarningFill, fields: ["Infringement Rate"] });
  }

  if (account.tags.includes("repeat-offender")) {
    tiles.push({ key: "repeatOffender", level: "high", label: "Repeat Offender", desc: "Previously flagged account", icon: RiAlertFill });
  }

  if (account.globalPosts >= 1000) {
    tiles.push({ key: "highVolume", level: "medium", label: "High Volume Seller", desc: `${account.globalPosts.toLocaleString("en-US")} global posts`, icon: RiErrorWarningFill, fields: ["Global Posts"] });
  }

  if (account.moderationPct < 20) {
    tiles.push({ key: "lowModeration", level: "high", label: "Low Moderation", desc: `Only ${account.moderationPct}% moderated`, icon: RiAlertFill, fields: ["Moderation Rate"] });
  }

  if (account.cluster !== "N/A") {
    tiles.push({ key: "clusterLinked", level: "medium", label: "Cluster Linked", desc: `Cluster #${account.cluster}`, icon: RiErrorWarningFill, fields: ["Cluster"] });
  }

  if (account.followers <= 5 && account.globalPosts >= 500) {
    tiles.push({ key: "suspiciousGeo", level: "medium", label: "Low Followers / High Posts", desc: `${account.followers} followers, ${account.globalPosts.toLocaleString("en-US")} posts`, icon: RiErrorWarningFill, fields: ["Followers"] });
  }

  // Sort by severity
  const order: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
  tiles.sort((a, b) => order[a.level] - order[b.level]);
  return tiles;
}

function buildFieldRisks(tiles: RiskTile[]): Record<string, RiskLevel> {
  const map: Record<string, RiskLevel> = {};
  for (const tile of tiles) {
    for (const field of tile.fields ?? []) {
      map[field] = tile.level;
    }
  }
  return map;
}

/* ─── Mock Account Data ─── */

function buildAccountNetwork(account: AccountData): {
  summary: string;
  directClones: NetworkEntity[];
  suspiciousLinks: NetworkEntity[];
  relatedEntities: NetworkEntity[];
  totalRelated: number;
} {
  const seed = account.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cloneCount = Math.min(3, Math.floor(account.postsOnBrand / 200) + 1);
  const directClones: NetworkEntity[] = Array.from({ length: cloneCount }, (_, i) => ({
    id: `${account.id}-alias-${i}`,
    kind: "account",
    name: `${account.name}_${["backup", "official", "outlet"][i] ?? `alt${i}`}`,
    subtitle: `${account.platform} · cloned profile`,
    riskScore: 90 - i * 5,
    href: "#",
  }));
  const suspiciousLinks: NetworkEntity[] = [
    {
      id: `${account.id}-site`,
      kind: "website",
      name: account.platform,
      subtitle: account.websiteCategory,
      riskScore: 72,
      href: "#",
    },
    {
      id: `${account.id}-posts`,
      kind: "post",
      name: `${account.postsOnBrand} infringing posts`,
      subtitle: `${account.infringementPct}% infringement rate`,
      riskScore: Math.min(95, 40 + account.infringementPct / 2),
      href: "#",
    },
    ...account.tags.slice(0, 2).map((t, i) => ({
      id: `${account.id}-tag-${i}`,
      kind: "seller" as const,
      name: `Tagged "${t}"`,
      subtitle: `Seed ${seed % 1000} · behavioural cluster`,
      riskScore: 58 - i * 6,
      href: "#",
    })),
  ];
  const relatedPosts: NetworkEntity[] = Array.from(
    { length: Math.min(account.postsOnBrand, 24) },
    (_, i) => ({
      id: `${account.id}-rp-${i}`,
      kind: "post" as const,
      name: `PO#${5000000 + ((seed * (i + 5)) % 9000000)}`,
      subtitle: `${account.platform} · listing`,
      riskScore: 88 - ((seed + i * 7) % 55),
      href: "#",
    })
  );
  const relatedAccounts: NetworkEntity[] = Array.from({ length: 6 }, (_, i) => ({
    id: `${account.id}-ra-${i}`,
    kind: "account" as const,
    name: `${account.name}_alias_${i + 1}`,
    subtitle: `${account.platform} · suspected alias`,
    riskScore: 78 - i * 5,
    href: "#",
  }));
  const relatedWebsites: NetworkEntity[] = [
    {
      id: `${account.id}-rw-main`,
      kind: "website" as const,
      name: account.platform,
      subtitle: account.websiteCategory,
      riskScore: 70,
      href: "#",
    },
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `${account.id}-rw-${i}`,
      kind: "website" as const,
      name: `${account.platform.split(".")[0]}-${["outlet", "deals", "shop", "store"][i]}.com`,
      subtitle: "Cross-posted destination",
      riskScore: 68 - i * 4,
      href: "#",
    })),
  ];
  const relatedEntities = [...relatedWebsites, ...relatedPosts, ...relatedAccounts];
  const totalRelated = directClones.length + suspiciousLinks.length + relatedEntities.length;
  const summary = `${account.postsOnBrand} posts on brand with ${directClones.length} cloned profiles detected.`;
  return { summary, directClones, suspiciousLinks, relatedEntities, totalRelated };
}

interface AccountData {
  id: string;
  name: string;
  status: "Active" | "Down";
  platform: string;
  avatarUrl: string;
  followers: number;
  globalPosts: number;
  postsOnBrand: number;
  geoEstimated: string;
  geoFlag: string;
  websiteCategory: string;
  description: string;
  bioCrawlingDate: string;
  label: string;
  infringementPct: number;
  moderationPct: number;
  postsModerated: number;
  postsUnmoderated: number;
  imagesModerated: number;
  imagesUnmoderated: number;
  cluster: string;
  tags: string[];
  visitUrl: string;
}

const MOCK_ACCOUNTS: Record<string, AccountData> = {
  "ACC-01": {
    id: "AC#148396941",
    name: "distancekuning",
    status: "Active",
    platform: "shopee.tw",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=201",
    followers: 2,
    globalPosts: 1043,
    postsOnBrand: 875,
    geoEstimated: "TW",
    geoFlag: "\u{1F1F9}\u{1F1FC}",
    websiteCategory: "Marketplace",
    description: "Description not available",
    bioCrawlingDate: "06 Apr 2026, 08:43 (GMT+02:00)",
    label: "Counterfeit",
    infringementPct: 100,
    moderationPct: 84,
    postsModerated: 731,
    postsUnmoderated: 144,
    imagesModerated: 1149,
    imagesUnmoderated: 2727,
    cluster: "N/A",
    tags: [],
    visitUrl: "https://shopee.tw/distancekuning",
  },
  "ACC-02": {
    id: "AC#259841072",
    name: "\u3010\u978B\u8001\u95C6\u3011\u904B\u52D5\u4F11\u9592\u978B \u5168\u65B0\u73FE\u8CA8",
    status: "Active",
    platform: "shopee.tw",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=202",
    followers: 156,
    globalPosts: 1047,
    postsOnBrand: 892,
    geoEstimated: "TW",
    geoFlag: "\u{1F1F9}\u{1F1FC}",
    websiteCategory: "Marketplace",
    description: "\u5168\u65B0\u73FE\u8CA8\u76F4\u5BC4\uFF0C\u5404\u5927\u54C1\u724C\u904B\u52D5\u978B\u6B3E\uFF0C\u4FDD\u8B49\u6B63\u54C1\u54C1\u8CEA",
    bioCrawlingDate: "02 Apr 2026, 14:22 (GMT+02:00)",
    label: "Counterfeit",
    infringementPct: 87,
    moderationPct: 62,
    postsModerated: 553,
    postsUnmoderated: 339,
    imagesModerated: 892,
    imagesUnmoderated: 1845,
    cluster: "3",
    tags: ["repeat-offender"],
    visitUrl: "https://shopee.tw/shoeboss_tw",
  },
  "ACC-03": {
    id: "AC#371029384",
    name: "KoreanStyle_Official",
    status: "Active",
    platform: "shopee.tw",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=203",
    followers: 843,
    globalPosts: 843,
    postsOnBrand: 621,
    geoEstimated: "TW",
    geoFlag: "\u{1F1F9}\u{1F1FC}",
    websiteCategory: "Marketplace",
    description: "\u97D3\u570B\u76F4\u9001\u6642\u5C1A\u7CBE\u54C1\uFF0C\u6BCF\u9031\u4E0A\u65B0\uFF0C\u6B61\u8FCE\u6279\u767C\u8A62\u554F",
    bioCrawlingDate: "01 Apr 2026, 09:15 (GMT+02:00)",
    label: "Suspicious",
    infringementPct: 45,
    moderationPct: 12,
    postsModerated: 74,
    postsUnmoderated: 547,
    imagesModerated: 198,
    imagesUnmoderated: 1204,
    cluster: "7",
    tags: ["korean-import", "bulk-seller"],
    visitUrl: "https://shopee.tw/koreanstyle_official",
  },
};

const DEFAULT_ACCOUNT: AccountData = {
  id: "AC#000000000",
  name: "Unknown Account",
  status: "Down",
  platform: "unknown",
  avatarUrl: "",
  followers: 0,
  globalPosts: 0,
  postsOnBrand: 0,
  geoEstimated: "\u2014",
  geoFlag: "",
  websiteCategory: "\u2014",
  description: "Description not available",
  bioCrawlingDate: "\u2014",
  label: "Unlabeled",
  infringementPct: 0,
  moderationPct: 0,
  postsModerated: 0,
  postsUnmoderated: 0,
  imagesModerated: 0,
  imagesUnmoderated: 0,
  cluster: "N/A",
  tags: [],
  visitUrl: "#",
};

const LABEL_STYLES: Record<string, string> = {
  Counterfeit: "bg-destructive hover:bg-destructive text-primary-foreground",
  Suspicious: "bg-orange-500 hover:bg-orange-600 text-primary-foreground",
  Unlabeled: "bg-secondary hover:bg-secondary text-foreground",
};

/* ─── Component ─── */

export function AccountModerationView({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [sidebarTab, setSidebarTab] = useState("overview");
  const [insightPrefs, setInsightPrefs] = useState<Record<InsightPrefKey, boolean>>(DEFAULT_INSIGHT_PREFS);

  // Resolve account from mock data
  const rawId = accountId.replace(/^AC%23|^AC#/, "");
  const account =
    Object.values(MOCK_ACCOUNTS).find(
      (a) => a.id === accountId || a.id === `AC#${rawId}` || a.id === accountId.replace("%23", "#")
    ) ??
    MOCK_ACCOUNTS[accountId] ??
    DEFAULT_ACCOUNT;

  const activeTiles = useMemo(
    () => computeAccountRiskTiles(account).filter((t) => insightPrefs[t.key as InsightPrefKey] !== false),
    [account, insightPrefs]
  );
  const fieldRisks = useMemo(() => buildFieldRisks(activeTiles), [activeTiles]);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* ── Entity Header ── */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 gap-2">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0 shrink">
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`size-2 rounded-full ${
                account.status === "Active" ? "bg-green-500" : "bg-destructive/100"
              }`}
            />
            <span className="text-[11px] text-muted-foreground">{account.status}</span>
          </div>
          <span className="text-lg font-bold text-foreground truncate">
            {account.id}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {account.bioCrawlingDate.split(",")[0]}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help hover:text-foreground transition-colors group mr-1">
            <div className="flex items-center gap-1 underline decoration-dashed decoration-border underline-offset-4 group-hover:decoration-muted-foreground transition-colors">
              <RiInformationLine className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="hidden xl:inline">To Moderate</span>
            </div>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <RiMessage3Line className="size-3.5" />
            <span className="hidden xl:inline">Comments</span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-secondary">
              0
            </Badge>
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs text-foreground">
            <RiNodeTree className="size-3.5" />
            <span className="hidden xl:inline">Rules</span>
          </Button>

          {/* Assessment Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <RiCheckboxMultipleLine className="size-3.5" />
                <span className="hidden xl:inline">Assessment</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[9px] bg-orange-100 text-orange-700">0</Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[450px] flex flex-col p-0 bg-card">
              <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
                <SheetTitle className="text-base">Assessment Reasons</SheetTitle>
              </SheetHeader>
              <div className="flex-1 flex flex-col min-h-0">
                <Tabs defaultValue="all" className="flex-1 flex flex-col w-full">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Flag Reasons</h3>
                    <TabsList className="h-7 bg-secondary/80 p-0.5">
                      <TabsTrigger value="selected" className="text-[10px] px-2.5 h-6">Selected (0)</TabsTrigger>
                      <TabsTrigger value="all" className="text-[10px] px-2.5 h-6">All</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="all" className="flex-1 flex flex-col p-0 m-0 min-h-0">
                    <div className="p-4 border-b border-border shrink-0">
                      <div className="relative">
                        <RiSearchLine className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input placeholder="Search reasons..." className="h-9 pl-9 text-xs bg-accent border-border" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between p-2.5 hover:bg-accent rounded-lg transition-colors">
                          <Label htmlFor="a-r-1" className="text-sm font-medium text-foreground cursor-pointer">Account sells counterfeit goods</Label>
                          <Switch id="a-r-1" />
                        </div>
                        <div className="flex items-center justify-between p-2.5 hover:bg-accent rounded-lg transition-colors">
                          <Label htmlFor="a-r-2" className="text-sm font-medium text-foreground cursor-pointer">Repeat offender</Label>
                          <Switch id="a-r-2" />
                        </div>
                        <div className="flex items-center justify-between p-2.5 hover:bg-accent rounded-lg transition-colors">
                          <Label htmlFor="a-r-3" className="text-sm font-medium text-foreground cursor-pointer">Obfuscated brand name</Label>
                          <Switch id="a-r-3" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="selected" className="flex-1 overflow-y-auto p-4 m-0">
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <RiCheckDoubleLine className="size-8 mb-2 opacity-40" />
                      <span className="text-xs">No reasons selected yet</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`h-8 text-xs px-3 rounded-md gap-1 ${
                  LABEL_STYLES[account.label] ?? LABEL_STYLES.Unlabeled
                }`}
              >
                {account.label}
                <RiArrowDownSLine className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Counterfeit", "Suspicious", "Legitimate", "Unlabeled"].map((opt) => (
                <DropdownMenuItem key={opt} className="text-xs flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      opt === "Counterfeit"
                        ? "bg-destructive/100"
                        : opt === "Suspicious"
                          ? "bg-orange-500"
                          : opt === "Legitimate"
                            ? "bg-emerald-500"
                            : "bg-muted-foreground"
                    }`}
                  />
                  {opt}
                  {opt === account.label && <RiCheckLine className="h-3.5 w-3.5 text-primary ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-foreground hover:bg-foreground/90 text-primary-foreground h-8 text-xs px-4 rounded-md">
            Enforce
          </Button>

          <Button variant="ghost" size="icon" className="size-8 p-0" onClick={() => router.push("/explore")}>
            <RiMoreLine className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* ── QUICK CONTEXT RISK BAR ── */}
      {activeTiles.length > 0 && (
        <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border bg-background shrink-0 overflow-x-auto custom-scrollbar">
          {activeTiles.map((tile, i) => {
            const s = RISK_TILE_STYLES[tile.level];
            return (
              <div key={i} className={`shrink-0 flex flex-col px-3 py-2 rounded-md border ${s.bg} ${s.border}`}>
                <div className="flex items-center gap-1.5">
                  <tile.icon className={`w-3 h-3 ${s.icon}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${s.label}`}>
                    {tile.label}
                  </span>
                </div>
                <span className={`text-xs font-medium mt-0.5 ${s.desc}`}>
                  {tile.desc}
                </span>
              </div>
            );
          })}

          {/* Prioritize / Customize Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="shrink-0 h-full min-h-[48px] border border-dashed border-border bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md px-3 flex flex-col gap-0.5 items-center justify-center transition-colors"
              >
                <RiSettings3Line className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase">Prioritize</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-foreground">Prioritize AI Insights</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Select which risk signals are most critical for your current review.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {INSIGHT_SIGNALS.map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5 pr-4">
                      <span className="text-sm font-semibold text-foreground">{signal.label}</span>
                      <span className="text-xs text-muted-foreground">{signal.desc}</span>
                    </div>
                    <Switch
                      checked={insightPrefs[signal.id]}
                      onCheckedChange={(checked) =>
                        setInsightPrefs((prev) => ({ ...prev, [signal.id]: checked }))
                      }
                      className="data-[state=checked]:bg-foreground"
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0 bg-card">
        {/* ── Left Pane: Cohesive Profile Card ── */}
        <div className="flex-1 bg-accent flex flex-col min-w-0 border-r border-border overflow-y-auto">
          <div className="p-6 flex flex-col items-center">
            <div className="w-full max-w-3xl">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-6">

                {/* Header: Avatar & Name */}
                <div className="flex items-start justify-between">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-secondary border border-border shadow-sm">
                      <ImageWithFallback
                        src={account.avatarUrl}
                        alt={account.name}
                        className="w-full h-full object-cover"
                        fallbackClassName="w-full h-full"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Name</span>
                      <h2 className="text-2xl font-bold text-foreground">{account.name}</h2>
                    </div>
                  </div>
                  <a
                    href={account.visitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary transition-colors shrink-0 mt-1"
                  >
                    Visit Account
                    <RiExternalLinkLine className="size-3.5" />
                  </a>
                </div>

                <div className="h-px bg-border w-full" />

                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
                  <div className="p-4 bg-accent rounded-lg text-sm text-foreground border border-border">
                    {account.description}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {account.tags.length > 0 ? (
                      account.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="h-6 px-2 py-0 text-[11px] font-medium bg-muted border border-border text-foreground rounded-sm shadow-none"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No tags</span>
                    )}
                    <button className="h-6 px-2 text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/10 rounded-sm transition-colors flex items-center gap-1">
                      <RiPriceTag3Line className="size-3" /> New Tag
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── Right Pane (Sidebar with Tabs) ── */}
        <aside className="w-[380px] xl:w-[450px] bg-card flex flex-col shrink-0 min-h-0">
          <Tabs
            value={sidebarTab}
            onValueChange={setSidebarTab}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Tabs Header */}
            <div className="flex items-center border-b border-border bg-card h-12 px-4 shrink-0">
              <TabsList
                variant="line"
                className="flex gap-4 xl:gap-6 bg-transparent rounded-none h-full w-auto p-0"
              >
                <TabsTrigger
                  value="overview"
                  className="text-xs font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiGlobalLine className="size-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="text-xs font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiFileTextLine className="size-3.5" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="text-xs font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiPulseLine className="size-3.5" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="network"
                  className="text-xs font-medium text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiNodeTree className="size-3.5" />
                  Network
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 min-h-0">
              {/* ── Overview Tab ── */}
              <TabsContent value="overview" className="p-6 m-0 space-y-8 pb-20">

                {/* Account Intelligence */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Account Intelligence</h3>
                  <div className="grid grid-cols-2 gap-y-5 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Account Name</span>
                      <span className="font-medium text-foreground">{account.name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Platform</span>
                      <a
                        href={`https://${account.platform}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline cursor-pointer"
                      >
                        {account.platform}
                      </a>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Followers</span>
                      <span className={fieldRisks["Followers"] ? RISK_VALUE_STYLES[fieldRisks["Followers"]] : "font-medium text-foreground"}>
                        {account.followers.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Geo (Estimated)</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <span className="text-base">{account.geoFlag}</span> {account.geoEstimated}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Website Category</span>
                      <span className="font-medium text-foreground">{account.websiteCategory}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Global Posts</span>
                      <span className={fieldRisks["Global Posts"] ? RISK_VALUE_STYLES[fieldRisks["Global Posts"]] : "font-medium text-foreground"}>
                        {account.globalPosts.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Posts on Brand</span>
                      <span className="font-medium text-foreground">{account.postsOnBrand.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Cluster</span>
                      <span className={fieldRisks["Cluster"] ? RISK_VALUE_STYLES[fieldRisks["Cluster"]] : `font-medium ${account.cluster === "N/A" ? "text-muted-foreground" : "text-foreground"}`}>
                        {account.cluster}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity & Behaviour */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Activity & Behaviour</h3>
                  <div className="grid grid-cols-2 gap-y-5 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Account ID</span>
                      <span className="font-medium text-foreground">{account.id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Bio Crawling Date</span>
                      <span className="font-medium text-foreground">{account.bioCrawlingDate.split(",")[0]}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Moderation Rate</span>
                      <span className={fieldRisks["Moderation Rate"] ? RISK_VALUE_STYLES[fieldRisks["Moderation Rate"]] : "font-medium text-foreground"}>
                        {account.moderationPct}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Infringement Rate</span>
                      <span className={fieldRisks["Infringement Rate"] ? RISK_VALUE_STYLES[fieldRisks["Infringement Rate"]] : "font-medium text-foreground"}>
                        {account.infringementPct}%
                      </span>
                    </div>
                  </div>
                </div>

              </TabsContent>

              {/* ── Details Tab ── */}
              <TabsContent value="details" className="p-6 m-0 space-y-8 pb-20">

                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Account Details</h3>
                  <div className="grid grid-cols-2 gap-y-5 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Account ID</span>
                      <span className="font-medium text-foreground">{account.id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Account Name</span>
                      <span className="font-medium text-foreground">{account.name}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Platform</span>
                      <a
                        href={`https://${account.platform}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline cursor-pointer"
                      >
                        {account.platform}
                      </a>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <span className={`size-1.5 rounded-full ${account.status === "Active" ? "bg-emerald-500" : "bg-destructive/100"}`} />
                        {account.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Followers</span>
                      <span className="font-medium text-foreground">{account.followers.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Geo (Estimated)</span>
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <span className="text-base">{account.geoFlag}</span> {account.geoEstimated}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Website Category</span>
                      <span className="font-medium text-foreground">{account.websiteCategory}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Cluster</span>
                      <span className={`font-medium ${account.cluster === "N/A" ? "text-muted-foreground" : "text-foreground"}`}>
                        {account.cluster}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Moderation Stats</h3>
                  <div className="grid grid-cols-2 gap-y-5 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Global Posts</span>
                      <span className="font-medium text-foreground">{account.globalPosts.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Posts on Brand</span>
                      <span className="font-medium text-foreground">{account.postsOnBrand.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Infringement %</span>
                      {account.infringementPct >= 50 ? (
                        <span className="font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded w-fit border border-red-100">
                          {account.infringementPct}%
                        </span>
                      ) : (
                        <span className="font-medium text-foreground">{account.infringementPct}%</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Moderation %</span>
                      <span className="font-medium text-foreground">{account.moderationPct}%</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Posts Moderated</span>
                      <span className="font-medium text-foreground">{account.postsModerated.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Posts Unmoderated</span>
                      <span className="font-medium text-foreground">{account.postsUnmoderated.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Images Moderated</span>
                      <span className="font-medium text-foreground">{account.imagesModerated.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">Images Unmoderated</span>
                      <span className="font-medium text-foreground">{account.imagesUnmoderated.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</h3>
                  <div className="text-sm text-foreground leading-relaxed bg-accent border border-border p-3 rounded min-h-[60px]">
                    {account.description}
                  </div>
                </div>

              </TabsContent>

              {/* ── Activity Tab ── */}
              <TabsContent value="activity" className="p-6 pb-20 m-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {[
                    { action: "Account crawled", time: account.bioCrawlingDate, icon: RiGlobalLine, color: "text-primary" },
                    { action: `Labeled as ${account.label}`, time: "02 Apr 2026, 14:22", icon: RiShieldCheckLine, color: "text-emerald-500" },
                    { action: "First post detected", time: "15 Mar 2026, 09:10", icon: RiPulseLine, color: "text-muted-foreground" },
                  ].map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <event.icon className={`size-3.5 ${event.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-foreground">{event.action}</div>
                        <div className="text-[11px] text-muted-foreground">{event.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ── Network Tab ── */}
              <TabsContent value="network" className="m-0 p-6 pb-20">
                {(() => {
                  const net = buildAccountNetwork(account);
                  return (
                    <NetworkTab
                      clusterLabel={account.label}
                      summary={net.summary}
                      directClones={net.directClones}
                      suspiciousLinks={net.suspiciousLinks}
                      relatedEntities={net.relatedEntities}
                      totalRelated={net.totalRelated}
                      contextLabel={account.id}
                    />
                  );
                })()}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
