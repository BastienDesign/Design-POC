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
  RiShieldCheckLine,
  RiImageLine,
  RiEyeLine,
  RiGroupLine,
  RiSparklingLine,
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
import { EXPLORE_IMAGES } from "@/lib/mock-data";

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
  high: { bg: "bg-red-50", border: "border-red-100", icon: "text-red-600", label: "text-red-800", desc: "text-red-900" },
  medium: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600", label: "text-amber-800", desc: "text-amber-900" },
  low: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600", label: "text-emerald-800", desc: "text-emerald-900" },
};

const RISK_VALUE_STYLES: Record<RiskLevel, string> = {
  high: "font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded w-fit border border-red-100",
  medium: "font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit border border-orange-100",
  low: "font-medium text-neutral-900",
};

const INSIGHT_SIGNALS = [
  { id: "logoDetected", label: "Logo Detected", desc: "Brand logo found in image via AI vision." },
  { id: "highSimilarity", label: "High Similarity", desc: "Image closely matches known infringing assets." },
  { id: "multipleDetections", label: "Multiple Detections", desc: "More than one brand signal detected." },
  { id: "suspiciousTags", label: "Suspicious Tags", desc: "Tags indicate potential infringement." },
  { id: "unvalidated", label: "Not Validated", desc: "Image has not yet been reviewed by a human." },
  { id: "widespreadUsage", label: "Widespread Usage", desc: "Image found across many accounts/posts." },
] as const;

type InsightPrefKey = (typeof INSIGHT_SIGNALS)[number]["id"];

const DEFAULT_INSIGHT_PREFS: Record<InsightPrefKey, boolean> = {
  logoDetected: true,
  highSimilarity: true,
  multipleDetections: true,
  suspiciousTags: true,
  unvalidated: true,
  widespreadUsage: true,
};

function computeImageRiskTiles(image: ImageData): RiskTile[] {
  const tiles: RiskTile[] = [];

  if (image.detections.length > 0) {
    const topConf = Math.max(...image.detections.map((d) => d.confidence));
    tiles.push({
      key: "logoDetected",
      level: topConf >= 90 ? "high" : "medium",
      label: "Logo Detected",
      desc: `${image.detections[0].brand} — ${topConf}% confidence`,
      icon: topConf >= 90 ? RiAlertFill : RiErrorWarningFill,
      fields: ["Detections"],
    });
  }

  if (image.detections.length > 1) {
    tiles.push({ key: "multipleDetections", level: "high", label: "Multiple Detections", desc: `${image.detections.length} brand signals`, icon: RiAlertFill });
  }

  if (image.similarity >= 85) {
    tiles.push({ key: "highSimilarity", level: "high", label: "High Similarity", desc: `${image.similarity}% match`, icon: RiAlertFill, fields: ["Similarity"] });
  } else if (image.similarity >= 70) {
    tiles.push({ key: "highSimilarity", level: "medium", label: "Similar Image", desc: `${image.similarity}% match`, icon: RiErrorWarningFill, fields: ["Similarity"] });
  }

  if (image.tags.some((t) => t.includes("suspicious") || t.includes("infringement"))) {
    tiles.push({ key: "suspiciousTags", level: "medium", label: "Suspicious Tags", desc: `${image.tags.length} risk tags`, icon: RiErrorWarningFill });
  }

  if (image.validatedBy === "\u2014") {
    tiles.push({ key: "unvalidated", level: "medium", label: "Not Validated", desc: "Awaiting human review", icon: RiErrorWarningFill });
  }

  if (image.postsCount >= 100) {
    tiles.push({ key: "widespreadUsage", level: "medium", label: "Widespread Usage", desc: `Found in ${image.postsCount} posts`, icon: RiErrorWarningFill, fields: ["Posts Count"] });
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

/* ─── Mock Image Data ─── */

function buildImageNetwork(image: ImageData): {
  summary: string;
  directClones: NetworkEntity[];
  suspiciousLinks: NetworkEntity[];
  totalRelated: number;
} {
  const seed = image.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cloneCount = Math.min(image.postsCount, 5);
  const directClones: NetworkEntity[] = Array.from({ length: cloneCount }, (_, i) => ({
    id: `${image.id}-post-${i}`,
    kind: "post",
    name: `PO#${2000000 + ((seed * (i + 5)) % 8000000)}`,
    subtitle: `${image.platform} · ${image.similarity}% similarity`,
    riskScore: 95 - i * 4,
    href: "#",
  }));
  const suspiciousLinks: NetworkEntity[] = [
    {
      id: `${image.id}-accounts`,
      kind: "account",
      name: `${image.accountsCount} related accounts`,
      subtitle: `Posting this image across ${image.platform}`,
      riskScore: Math.min(90, 40 + image.accountsCount),
      href: "#",
    },
    {
      id: `${image.id}-websites`,
      kind: "website",
      name: `${image.websitesCount} hosting websites`,
      subtitle: "Distributed across marketplaces",
      riskScore: Math.min(85, 35 + image.websitesCount * 2),
      href: "#",
    },
    ...image.detections.slice(0, 2).map((d, i) => ({
      id: `${image.id}-brand-${i}`,
      kind: "image" as const,
      name: `${d.brand} brand match`,
      subtitle: `${d.type} · ${d.confidence}% confidence`,
      riskScore: d.confidence,
      href: "#",
    })),
  ];
  const totalRelated = image.postsCount + image.accountsCount + image.websitesCount;
  const summary = `${image.postsCount} posts and ${image.accountsCount} accounts share this image across ${image.websitesCount} sites.`;
  return { summary, directClones, suspiciousLinks, totalRelated };
}

interface ImageData {
  id: string;
  imageUrl: string;
  objective: string;
  productCategory: string;
  sourceOriginalUrl: string;
  validatedBy: string;
  crawlingDate: string;
  label: string;
  isOfficialPhoto: boolean;
  detections: { brand: string; type: string; confidence: number }[];
  tags: string[];
  parentPostId: string;
  parentPostTitle: string;
  postsCount: number;
  accountsCount: number;
  websitesCount: number;
  similarity: number;
  platform: string;
}

const MOCK_IMAGES: Record<string, ImageData> = {
  "img-1": {
    id: "IM#3018809375",
    imageUrl: "https://picsum.photos/seed/nike-shoe1/800/800",
    objective: "N/A",
    productCategory: "N/A",
    sourceOriginalUrl: "https://shopee.tw/product/148396941/3018809375",
    validatedBy: "Lauren M.",
    crawlingDate: "13 Mar 2025, 07:04",
    label: "Counterfeit",
    isOfficialPhoto: false,
    detections: [
      { brand: "Nike", type: "logo detected", confidence: 94 },
    ],
    tags: [
      "suspicious_source",
      "suspicious_source-post_potential_infringement",
      "suspicious_source-post_uploaded_manually",
      "suspicious_source-poster_has_post_potential_infringement",
    ],
    parentPostId: "PO#22948998",
    parentPostTitle: "Nike Air Force 1 Low White",
    postsCount: 342,
    accountsCount: 87,
    websitesCount: 12,
    similarity: 92,
    platform: "shopee.tw",
  },
  "img-2": {
    id: "IM#4521903847",
    imageUrl: "https://picsum.photos/seed/nike-shoe2/800/800",
    objective: "Trademark",
    productCategory: "Footwear",
    sourceOriginalUrl: "https://shopee.tw/product/259841072/4521903847",
    validatedBy: "Thomas K.",
    crawlingDate: "28 Feb 2025, 14:22",
    label: "Suspicious",
    isOfficialPhoto: false,
    detections: [
      { brand: "Nike", type: "logo detected", confidence: 87 },
      { brand: "Nike", type: "swoosh pattern", confidence: 72 },
    ],
    tags: [
      "suspicious_source",
      "bulk_upload",
    ],
    parentPostId: "PO#33819204",
    parentPostTitle: "Sports Shoes Wholesale Lot",
    postsCount: 189,
    accountsCount: 43,
    websitesCount: 8,
    similarity: 78,
    platform: "shopee.tw",
  },
  "img-3": {
    id: "IM#7830291045",
    imageUrl: "https://picsum.photos/seed/nike-shoe3/800/800",
    objective: "N/A",
    productCategory: "N/A",
    sourceOriginalUrl: "https://lazada.co.th/product/371029384/7830291045",
    validatedBy: "—",
    crawlingDate: "05 Jan 2025, 09:15",
    label: "Unlabeled",
    isOfficialPhoto: true,
    detections: [],
    tags: [],
    parentPostId: "PO#55102837",
    parentPostTitle: "Official Brand Sneakers",
    postsCount: 12,
    accountsCount: 3,
    websitesCount: 2,
    similarity: 65,
    platform: "lazada.co.th",
  },
};

const DEFAULT_IMAGE: ImageData = {
  id: "IM#000000000",
  imageUrl: "",
  objective: "N/A",
  productCategory: "N/A",
  sourceOriginalUrl: "",
  validatedBy: "\u2014",
  crawlingDate: "\u2014",
  label: "Unlabeled",
  isOfficialPhoto: false,
  detections: [],
  tags: [],
  parentPostId: "",
  parentPostTitle: "Unknown",
  postsCount: 0,
  accountsCount: 0,
  websitesCount: 0,
  similarity: 0,
  platform: "unknown",
};

const LABEL_STYLES: Record<string, string> = {
  Counterfeit: "bg-red-600 hover:bg-red-700 text-white",
  Suspicious: "bg-orange-500 hover:bg-orange-600 text-white",
  Unlabeled: "bg-neutral-200 hover:bg-neutral-300 text-neutral-700",
};

/* ─── Related Image Thumbnails ─── */

const RELATED_IMAGES = EXPLORE_IMAGES.slice(0, 8);

/* ─── Component ─── */

export function ImageModerationView({ imageId }: { imageId: string }) {
  const router = useRouter();
  const [sidebarTab, setSidebarTab] = useState("overview");
  const [insightPrefs, setInsightPrefs] = useState<Record<InsightPrefKey, boolean>>(DEFAULT_INSIGHT_PREFS);

  // Resolve image from mock data
  const image =
    MOCK_IMAGES[imageId] ??
    Object.values(MOCK_IMAGES).find(
      (img) => img.id === imageId || img.id === imageId.replace("%23", "#")
    ) ??
    DEFAULT_IMAGE;

  const activeTiles = useMemo(
    () => computeImageRiskTiles(image).filter((t) => insightPrefs[t.key as InsightPrefKey] !== false),
    [image, insightPrefs]
  );
  const fieldRisks = useMemo(() => buildFieldRisks(activeTiles), [activeTiles]);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* ── Entity Header ── */}
      <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0 gap-2">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0 shrink">
          <span className="text-lg font-bold text-neutral-900 truncate">
            {image.id}
          </span>
          <span className="text-[11px] text-neutral-400 shrink-0">
            {image.crawlingDate}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Validated by */}
          {image.validatedBy !== "\u2014" && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mr-1">
              <RiShieldCheckLine className="size-3 text-emerald-500" />
              <span>Validated by <span className="font-medium text-neutral-700">{image.validatedBy}</span></span>
            </div>
          )}

          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <RiMessage3Line className="size-3.5" />
            <span className="hidden xl:inline">Comments</span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-neutral-200">
              0
            </Badge>
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs text-neutral-600">
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
            <SheetContent side="right" className="w-[400px] sm:w-[450px] flex flex-col p-0 bg-white">
              <SheetHeader className="px-6 py-4 border-b border-neutral-100 shrink-0">
                <SheetTitle className="text-base">Assessment Reasons</SheetTitle>
              </SheetHeader>
              <div className="flex-1 flex flex-col min-h-0">
                <Tabs defaultValue="all" className="flex-1 flex flex-col w-full">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Flag Reasons</h3>
                    <TabsList className="h-7 bg-neutral-200/80 p-0.5">
                      <TabsTrigger value="selected" className="text-[10px] px-2.5 h-6">Selected (0)</TabsTrigger>
                      <TabsTrigger value="all" className="text-[10px] px-2.5 h-6">All</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="all" className="flex-1 flex flex-col p-0 m-0 min-h-0">
                    <div className="p-4 border-b border-neutral-100 shrink-0">
                      <div className="relative">
                        <RiSearchLine className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                        <Input placeholder="Search reasons..." className="h-9 pl-9 text-xs bg-neutral-50 border-neutral-200" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                          <Label htmlFor="i-r-1" className="text-sm font-medium text-neutral-700 cursor-pointer">Counterfeit product image</Label>
                          <Switch id="i-r-1" />
                        </div>
                        <div className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                          <Label htmlFor="i-r-2" className="text-sm font-medium text-neutral-700 cursor-pointer">Trademark logo visible</Label>
                          <Switch id="i-r-2" />
                        </div>
                        <div className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                          <Label htmlFor="i-r-3" className="text-sm font-medium text-neutral-700 cursor-pointer">Low-quality replica</Label>
                          <Switch id="i-r-3" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="selected" className="flex-1 overflow-y-auto p-4 m-0">
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                      <RiCheckDoubleLine className="size-8 mb-2 opacity-40" />
                      <span className="text-xs">No reasons selected yet</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>

          <Separator orientation="vertical" className="!self-auto h-5 mx-1" />

          {/* Official Photo toggle */}
          <div className="flex items-center gap-1.5 mr-1">
            <div className={`h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
              image.isOfficialPhoto
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
            }`}>
              <RiImageLine className="size-3.5" />
              <span className="hidden xl:inline">Official Photo</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`h-8 text-xs px-3 rounded-md gap-1 ${
                  LABEL_STYLES[image.label] ?? LABEL_STYLES.Unlabeled
                }`}
              >
                {image.label}
                <RiArrowDownSLine className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Counterfeit", "Suspicious", "Legitimate", "Unlabeled"].map((opt) => (
                <DropdownMenuItem key={opt} className="text-xs flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      opt === "Counterfeit"
                        ? "bg-red-500"
                        : opt === "Suspicious"
                          ? "bg-orange-500"
                          : opt === "Legitimate"
                            ? "bg-emerald-500"
                            : "bg-neutral-400"
                    }`}
                  />
                  {opt}
                  {opt === image.label && <RiCheckLine className="h-3.5 w-3.5 text-blue-600 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-neutral-900 hover:bg-neutral-800 text-white h-8 text-xs px-4 rounded-md">
            Enforce
          </Button>

          <Button variant="ghost" size="icon" className="size-8 p-0" onClick={() => router.push("/explore")}>
            <RiMoreLine className="size-4 text-neutral-500" />
          </Button>
        </div>
      </header>

      {/* ── QUICK CONTEXT RISK BAR ── */}
      {activeTiles.length > 0 && (
        <div className="flex items-center gap-3 px-6 py-2.5 border-b border-neutral-200 bg-neutral-50 shrink-0 overflow-x-auto custom-scrollbar">
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
                className="shrink-0 h-full min-h-[48px] border border-dashed border-neutral-300 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-md px-3 flex flex-col gap-0.5 items-center justify-center transition-colors"
              >
                <RiSettings3Line className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase">Prioritize</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-neutral-900">Prioritize AI Insights</DialogTitle>
                <DialogDescription className="text-sm text-neutral-500">
                  Select which risk signals are most critical for your current review.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {INSIGHT_SIGNALS.map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5 pr-4">
                      <span className="text-sm font-semibold text-neutral-900">{signal.label}</span>
                      <span className="text-xs text-neutral-500">{signal.desc}</span>
                    </div>
                    <Switch
                      checked={insightPrefs[signal.id]}
                      onCheckedChange={(checked) =>
                        setInsightPrefs((prev) => ({ ...prev, [signal.id]: checked }))
                      }
                      className="data-[state=checked]:bg-neutral-900"
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0 bg-white">
        {/* ── Left Pane: Image + Tags ── */}
        <div className="flex-1 bg-neutral-50 flex flex-col min-w-0 border-r border-neutral-200 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 p-6 gap-6">

            {/* Image Stage */}
            <div className="flex-1 min-h-0 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex items-center justify-center relative">
              <ImageWithFallback
                src={image.imageUrl}
                alt={image.id}
                className="max-w-full max-h-full object-contain"
                fallbackClassName="w-full h-full"
              />

              {/* Detection bounding box overlay */}
              {image.detections.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Mock bounding box */}
                  <div className="absolute top-[15%] left-[20%] w-[35%] h-[40%] border-2 border-emerald-400 rounded bg-emerald-400/5">
                    <div className="absolute -top-6 left-0 bg-neutral-900 text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1.5">
                      <RiSparklingLine className="size-3 text-emerald-400" />
                      {image.detections[0].brand} &mdash; {image.detections[0].type}
                    </div>
                  </div>
                </div>
              )}

              {/* Magic pill */}
              <div className="absolute top-3 right-3 bg-neutral-900/80 text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                <RiSparklingLine className="size-3" />
                Magic pill
              </div>
            </div>

            {/* Tags */}
            <div className="shrink-0">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {image.tags.length > 0 ? (
                  image.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="h-6 px-2 py-0 text-[10px] font-medium bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-sm shadow-none max-w-[260px] truncate"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-neutral-400 italic">No tags</span>
                )}
                <button className="h-6 px-2 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-sm transition-colors flex items-center gap-1">
                  <RiPriceTag3Line className="size-3" /> New Tag
                </button>
              </div>
            </div>

            {/* Related Images Strip */}
            <div className="shrink-0">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Related Images</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {RELATED_IMAGES.map((ri) => (
                  <div
                    key={ri.id}
                    className="shrink-0 w-[90px] cursor-pointer group"
                  >
                    <div className="w-[90px] h-[90px] rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 group-hover:border-neutral-400 transition-colors">
                      <ImageWithFallback
                        src={ri.thumbnailUrl}
                        alt={ri.imageId}
                        className="w-full h-full object-cover"
                        fallbackClassName="w-full h-full"
                      />
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1 truncate text-center">{ri.imageId}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Right Pane (Sidebar with Tabs) ── */}
        <aside className="w-[380px] xl:w-[450px] bg-white flex flex-col shrink-0 min-h-0">
          <Tabs
            value={sidebarTab}
            onValueChange={setSidebarTab}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Tabs Header */}
            <div className="flex items-center border-b border-neutral-200 bg-white h-12 px-4 shrink-0">
              <TabsList
                variant="line"
                className="flex gap-4 xl:gap-6 bg-transparent rounded-none h-full w-auto p-0"
              >
                <TabsTrigger
                  value="overview"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiGlobalLine className="size-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiFileTextLine className="size-3.5" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiPulseLine className="size-3.5" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="network"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
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

                {/* Image Intelligence */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Image Intelligence</h3>
                  <div className="grid grid-cols-2 gap-y-5 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Objective</span>
                      <span className={`font-medium ${image.objective === "N/A" ? "text-neutral-400" : "text-neutral-900"}`}>
                        {image.objective}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Product Category</span>
                      <span className={`font-medium ${image.productCategory === "N/A" ? "text-neutral-400" : "text-neutral-900"}`}>
                        {image.productCategory}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Platform</span>
                      <a
                        href={`https://${image.platform}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline cursor-pointer"
                      >
                        {image.platform}
                      </a>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Similarity</span>
                      <span className={fieldRisks["Similarity"] ? RISK_VALUE_STYLES[fieldRisks["Similarity"]] : "font-medium text-neutral-900"}>{image.similarity}%</span>
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-xs text-neutral-500">Source Original URL</span>
                      {image.sourceOriginalUrl ? (
                        <a
                          href={image.sourceOriginalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline cursor-pointer text-xs break-all"
                        >
                          {image.sourceOriginalUrl}
                        </a>
                      ) : (
                        <span className="font-medium text-neutral-400">N/A</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detections */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Detections</h3>
                  {image.detections.length > 0 ? (
                    <div className="space-y-2">
                      {image.detections.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50"
                        >
                          <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <RiEyeLine className="size-3.5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-neutral-900">
                              {d.brand} &mdash; {d.type}
                            </div>
                            <div className="text-[11px] text-neutral-500">
                              Confidence: {d.confidence}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-400 italic">No detections</div>
                  )}
                </div>

                {/* Comments */}
                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Comments</h3>
                  <div className="relative">
                    <Input
                      placeholder="Add a New Comment..."
                      className="h-10 text-sm bg-neutral-50 border-neutral-200 pr-20"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-8 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Send
                    </Button>
                  </div>
                </div>

              </TabsContent>

              {/* ── Details Tab ── */}
              <TabsContent value="details" className="p-6 m-0 space-y-8 pb-20">

                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Image Details</h3>
                  <div className="grid grid-cols-2 gap-y-5 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Image ID</span>
                      <span className="font-medium text-neutral-900">{image.id}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Crawling Date</span>
                      <span className="font-medium text-neutral-900">{image.crawlingDate}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Objective</span>
                      <span className={`font-medium ${image.objective === "N/A" ? "text-neutral-400" : "text-neutral-900"}`}>
                        {image.objective}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Product Category</span>
                      <span className={`font-medium ${image.productCategory === "N/A" ? "text-neutral-400" : "text-neutral-900"}`}>
                        {image.productCategory}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Platform</span>
                      <a
                        href={`https://${image.platform}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline cursor-pointer"
                      >
                        {image.platform}
                      </a>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Similarity</span>
                      <span className={fieldRisks["Similarity"] ? RISK_VALUE_STYLES[fieldRisks["Similarity"]] : "font-medium text-neutral-900"}>{image.similarity}%</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Validated By</span>
                      <span className={`font-medium ${image.validatedBy === "\u2014" ? "text-neutral-400" : "text-neutral-900"}`}>
                        {image.validatedBy}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Official Photo</span>
                      <span className="font-medium text-neutral-900">{image.isOfficialPhoto ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Source</h3>
                  <div className="grid grid-cols-1 gap-y-5 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Source Original URL</span>
                      {image.sourceOriginalUrl ? (
                        <a
                          href={image.sourceOriginalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline cursor-pointer text-xs break-all"
                        >
                          {image.sourceOriginalUrl}
                        </a>
                      ) : (
                        <span className="font-medium text-neutral-400">N/A</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-neutral-500">Parent Post</span>
                      <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                        {image.parentPostId} &mdash; {image.parentPostTitle}
                      </span>
                    </div>
                  </div>
                </div>

              </TabsContent>

              {/* ── Activity Tab ── */}
              <TabsContent value="activity" className="p-6 pb-20 m-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {[
                    { action: "Image crawled", time: image.crawlingDate, icon: RiGlobalLine, color: "text-blue-500" },
                    ...(image.validatedBy !== "\u2014"
                      ? [{ action: `Validated by ${image.validatedBy}`, time: "14 Mar 2025, 10:30", icon: RiShieldCheckLine, color: "text-emerald-500" }]
                      : []),
                    { action: `Labeled as ${image.label}`, time: "14 Mar 2025, 10:31", icon: RiShieldCheckLine, color: "text-emerald-500" },
                    ...(image.detections.length > 0
                      ? [{ action: `${image.detections.length} detection(s) found`, time: image.crawlingDate, icon: RiEyeLine, color: "text-orange-500" }]
                      : []),
                  ].map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="size-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                        <event.icon className={`size-3.5 ${event.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-neutral-900">{event.action}</div>
                        <div className="text-[11px] text-neutral-500">{event.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ── Network Tab ── */}
              <TabsContent value="network" className="m-0 p-6 pb-20">
                {(() => {
                  const net = buildImageNetwork(image);
                  return (
                    <NetworkTab
                      clusterLabel={image.label}
                      summary={net.summary}
                      directClones={net.directClones}
                      suspiciousLinks={net.suspiciousLinks}
                      totalRelated={net.totalRelated}
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
