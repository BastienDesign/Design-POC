"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiExternalLinkLine,
  RiAlertLine,
  RiAlertFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiInformationLine,
  RiMapPinLine,
  RiPriceTag3Line,
  RiShieldCheckLine,
  RiShieldLine,
  RiCheckLine,
  RiCheckDoubleLine,
  RiSettings3Line,
  RiPlayFill,
  RiFilmLine,
  RiClosedCaptioningLine,
  RiGlobalLine,
  RiFileTextLine,
  RiPulseLine,
  RiTimeLine,
  RiNodeTree,
  RiUserLine,
  RiBoxingLine,
  RiMoreLine,
  RiMessage3Line,
  RiSidebarFoldLine,
  RiBuildingLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { ExplorePost, LabelType, MediaLabel, PostMedia } from "@/lib/mock-data";
import { EXPLORE_POSTS, SUB_ORGANIZATIONS } from "@/lib/mock-data";
import { ImageWithFallback } from "./image-with-fallback";
import { VERDICT_OPTIONS, VERDICT_TRIGGER_STYLE } from "./verdict-options";

const LABEL_COLORS: Record<string, string> = {
  counterfeit: "bg-red-500",
  suspicious: "bg-amber-500",
  legitimate: "bg-emerald-500",
  "trademark infringement": "bg-orange-400",
  unlabeled: "bg-neutral-400",
};

const MEDIA_LABEL_DOT: Record<string, string> = {
  counterfeit: "bg-red-500",
  suspicious: "bg-amber-500",
  legitimate: "bg-emerald-500",
  unlabeled: "bg-neutral-300",
};

type RiskLevel = "high" | "medium" | "low";

interface InsightTile {
  key: string;
  level: RiskLevel;
  label: string;
  desc: string;
  icon: typeof RiAlertFill;
  /** Which metadata field labels this tile affects (for heatmap row highlighting) */
  fields?: string[];
}

interface AiInsights {
  tiles: InsightTile[];
  fieldRisks: Record<string, RiskLevel>;
}

/** Available insight signal definitions for the Prioritize dialog */
const INSIGHT_SIGNALS = [
  { id: "priceAnomaly", label: "Price Anomaly", desc: "Detects unusual price drops vs retail." },
  { id: "accountRisk", label: "Account Risk", desc: "Flags new or historically problematic sellers." },
  { id: "geoMismatch", label: "Geo Mismatch", desc: "Highlights unusual shipping origins." },
  { id: "highImpact", label: "High Impact", desc: "Alerts on high-impact score items." },
  { id: "highVolume", label: "High Volume", desc: "Alerts on suspicious stock quantities." },
  { id: "clonedMedia", label: "Cloned Media", desc: "Detects media reused across multiple listings." },
] as const;

type InsightPrefKey = (typeof INSIGHT_SIGNALS)[number]["id"];

const DEFAULT_INSIGHT_PREFS: Record<InsightPrefKey, boolean> = {
  priceAnomaly: true,
  accountRisk: true,
  geoMismatch: true,
  highImpact: true,
  highVolume: true,
  clonedMedia: true,
};

/** Simulate AI risk analysis from the current item's data */
function getAiInsights(item: ExplorePost): AiInsights {
  const tiles: InsightTile[] = [];
  const fieldRisks: Record<string, RiskLevel> = {};

  // Price anomaly detection
  const pricePctNum = parseFloat(item.pricePct.replace(/[^0-9.-]/g, ""));
  if (pricePctNum <= -60) {
    tiles.push({ key: "priceAnomaly", level: "high", label: "Price Anomaly", desc: `${item.pricePct} vs Retail`, icon: RiAlertFill, fields: ["Price"] });
    fieldRisks["Price"] = "high";
  } else if (pricePctNum <= -30) {
    tiles.push({ key: "priceAnomaly", level: "medium", label: "Price Below Avg", desc: `${item.pricePct} vs Retail`, icon: RiErrorWarningFill, fields: ["Price"] });
    fieldRisks["Price"] = "medium";
  }

  // Account age / risk
  if (item.accountTagType === "counterfeit" || item.accountTagType === "suspicious") {
    const level: RiskLevel = item.accountTagType === "counterfeit" ? "high" : "medium";
    tiles.push({
      key: "accountRisk",
      level,
      label: "Account Risk",
      desc: `Tagged ${item.accountTag}`,
      icon: level === "high" ? RiAlertFill : RiErrorWarningFill,
      fields: ["Account Name", "Account Tag"],
    });
    fieldRisks["Account Name"] = level;
    fieldRisks["Account Tag"] = level;
  }

  // Geo mismatch — ships from different region than platform geo
  if (item.shipsFrom.toLowerCase() !== item.platformGeo.toLowerCase()) {
    tiles.push({ key: "geoMismatch", level: "medium", label: "Geo Mismatch", desc: `Ships from ${item.shipsFrom}`, icon: RiErrorWarningFill, fields: ["Platform Geo", "Ships From"] });
    fieldRisks["Platform Geo"] = "medium";
    fieldRisks["Ships From"] = "medium";
  }

  // Cloned media detection (simulated)
  if (item.media && item.media.length >= 3) {
    tiles.push({ key: "clonedMedia", level: "medium", label: "Cloned Media", desc: `Matches ${Math.floor(item.media.length * 2.5)} listings`, icon: RiErrorWarningFill });
  }

  // Impact score
  if (item.impactScore >= 80) {
    tiles.push({ key: "highImpact", level: "high", label: "High Impact", desc: `Score ${item.impactScore}/100`, icon: RiAlertFill, fields: ["Impact Score"] });
    fieldRisks["Impact Score"] = "high";
  } else if (item.impactScore >= 50) {
    fieldRisks["Impact Score"] = "medium";
  }

  // Volume sold spike
  if (item.volumeSold >= 500) {
    tiles.push({ key: "highVolume", level: "medium", label: "High Volume", desc: `${item.volumeSold.toLocaleString("en-US")} units sold`, icon: RiErrorWarningFill });
  }

  // Sort by severity (high → medium → low)
  const order: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
  tiles.sort((a, b) => order[a.level] - order[b.level]);

  return { tiles, fieldRisks };
}

function riskOrder(level: RiskLevel): number {
  return level === "high" ? 0 : level === "medium" ? 1 : 2;
}

const RISK_TILE_STYLES: Record<RiskLevel, { bg: string; border: string; icon: string; label: string; desc: string }> = {
  high: { bg: "bg-red-50", border: "border-red-100", icon: "text-red-600", label: "text-red-800", desc: "text-red-900" },
  medium: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600", label: "text-amber-800", desc: "text-amber-900" },
  low: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600", label: "text-emerald-800", desc: "text-emerald-900" },
};

const RISK_ROW_STYLES: Record<RiskLevel, { bg: string; border: string; label: string; value: string }> = {
  high: { bg: "bg-red-50/50", border: "border-red-100", label: "text-red-600", value: "text-red-900" },
  medium: { bg: "bg-amber-50/50", border: "border-amber-100", label: "text-amber-600", value: "text-amber-900" },
  low: { bg: "bg-emerald-50/30", border: "border-emerald-100", label: "text-emerald-600", value: "text-emerald-900" },
};

const RISK_VALUE_STYLES: Record<RiskLevel, string> = {
  high: "font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded w-fit border border-red-100",
  medium: "font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit border border-orange-100",
  low: "font-medium text-neutral-900",
};

/* ─── Reusable Sub-Components (matching website view pattern) ─── */

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="size-3.5 text-neutral-400" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">
        {label}
      </span>
    </div>
  );
}

function DataPoint({
  label,
  value,
  isLink = false,
  risk,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  risk?: RiskLevel;
}) {
  const valueClass = risk
    ? `text-[12px] ${RISK_VALUE_STYLES[risk]}`
    : "text-[12px] font-medium text-neutral-900";

  return (
    <div>
      <div className="text-[10px] text-neutral-500 mb-1">{label}</div>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-medium text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <div className={valueClass}>{value}</div>
      )}
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  iconColor,
  action,
  detail,
  time,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  action: string;
  detail?: string;
  time: string;
}) {
  return (
    <div className="flex gap-3 mb-4 relative">
      <div className="size-6 rounded-full bg-white border border-neutral-200 flex items-center justify-center z-10 shrink-0">
        <Icon className={`size-3 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-medium text-neutral-900">
            {action}
          </span>
          <span className="text-[10px] text-neutral-500 whitespace-nowrap">
            {time}
          </span>
        </div>
        {detail && (
          <span className="text-[11px] text-neutral-500">{detail}</span>
        )}
      </div>
    </div>
  );
}

function TimelineGroup({
  date,
  items,
}: {
  date: string;
  items: {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    action: string;
    detail?: string;
    time: string;
  }[];
}) {
  return (
    <>
      <div className="text-xs font-bold text-neutral-900 mt-6 first:mt-0 mb-4">
        {date}
      </div>
      <div className="relative pl-0">
        <div className="absolute left-[11px] top-3 bottom-0 border-l border-neutral-200" />
        {items.map((item, i) => (
          <TimelineItem key={i} {...item} />
        ))}
      </div>
    </>
  );
}

interface ModerationWorkspaceProps {
  /** Standalone route mode: pass a single postId, component resolves data internally */
  postId?: string;
  /** Batch/overlay mode: pass a queue of posts */
  queue?: ExplorePost[];
  currentIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
  onExit?: () => void;
  onVerdict?: (postId: string, label: LabelType, labelText: string) => void;
}

export function ModerationWorkspace({
  postId: standalonePostId,
  queue: externalQueue,
  currentIndex: externalIndex = 0,
  onNext: externalNext,
  onPrev: externalPrev,
  onExit: externalExit,
  onVerdict: externalVerdict,
}: ModerationWorkspaceProps) {
  const router = useRouter();

  // Standalone mode: resolve post from EXPLORE_POSTS by postId
  const standalonePost = useMemo(() => {
    if (!standalonePostId) return null;
    // postId could be "PO#2168513" or just "2168513"
    const cleanId = standalonePostId.replace(/^PO#/, "");
    return EXPLORE_POSTS.find((p) => p.postId === cleanId) ?? null;
  }, [standalonePostId]);

  const isStandalone = !!standalonePostId;
  const queue = externalQueue ?? (standalonePost ? [standalonePost] : []);
  const currentIndex = externalIndex;
  const onNext = externalNext ?? (() => {});
  const onPrev = externalPrev ?? (() => {});
  const onExit = externalExit ?? (() => router.push("/explore"));
  const onVerdict = externalVerdict ?? (() => {});

  const currentItem = queue[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === queue.length - 1;
  const isBatch = queue.length > 1;

  // Guard: if post not found in standalone mode
  if (!currentItem) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-white absolute inset-0 z-50">
        <p className="text-sm text-neutral-500">Post not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/explore")}>
          Back to Explore
        </Button>
      </div>
    );
  }
  const progress = ((currentIndex + 1) / queue.length) * 100;
  const dotColor = LABEL_COLORS[currentItem.label] ?? "bg-neutral-400";

  // Media player state
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number | null>(null);
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Local label overrides: { [mediaId]: newLabel }
  const [labelOverrides, setLabelOverrides] = useState<Record<string, MediaLabel>>({});

  // Reset media state when switching items
  useEffect(() => {
    setActiveMediaIndex(0);
    setActiveFrameIndex(null);
    setIsVideoPaused(true);
    setShowSubtitles(false);
  }, [currentItem.id]);

  const activeMedia = currentItem.media[activeMediaIndex] ?? currentItem.media[0];
  const activeFrame = activeFrameIndex !== null && activeMedia.frames
    ? activeMedia.frames[activeFrameIndex] ?? null
    : null;
  const displayMedia: PostMedia = activeFrame ?? activeMedia;

  // Resolve label from overrides, falling back to original
  const resolveLabel = (media: PostMedia): MediaLabel => labelOverrides[media.id] ?? media.label;
  const currentLabel = resolveLabel(displayMedia);
  const mediaLabelDot = MEDIA_LABEL_DOT[currentLabel] ?? "bg-neutral-300";
  const mediaLabelText = currentLabel.charAt(0).toUpperCase() + currentLabel.slice(1);

  function handleMediaLabelChange(newLabel: MediaLabel) {
    setLabelOverrides((prev) => ({ ...prev, [displayMedia.id]: newLabel }));
  }

  const showFrameStrip =
    activeMedia.type === "video" &&
    activeMedia.frames &&
    activeMedia.frames.length > 0;

  function handleSelectMedia(index: number) {
    setActiveMediaIndex(index);
    setActiveFrameIndex(null);
    setIsVideoPaused(true);
  }

  // Insight preferences — which AI signals the user wants active
  const [insightPrefs, setInsightPrefs] = useState<Record<InsightPrefKey, boolean>>(DEFAULT_INSIGHT_PREFS);

  // Raw insights from the AI engine
  const rawInsights = useMemo(() => getAiInsights(currentItem), [currentItem]);

  // Filtered insights based on user preferences
  const insights = useMemo<AiInsights>(() => {
    const activeTiles = rawInsights.tiles.filter((t) => insightPrefs[t.key as InsightPrefKey] !== false);

    // Rebuild fieldRisks from only the active tiles
    const activeFieldRisks: Record<string, RiskLevel> = {};
    for (const tile of activeTiles) {
      if (tile.fields) {
        for (const field of tile.fields) {
          // Keep the highest severity if multiple tiles affect the same field
          const existing = activeFieldRisks[field];
          if (!existing || riskOrder(tile.level) < riskOrder(existing)) {
            activeFieldRisks[field] = tile.level;
          }
        }
      }
    }
    // Preserve field risks from non-tile sources (e.g. impact score medium) only if their key is active
    for (const [field, level] of Object.entries(rawInsights.fieldRisks)) {
      if (!(field in activeFieldRisks)) {
        // Check if any active tile would have contributed this field
        const contributingTile = rawInsights.tiles.find((t) => t.fields?.includes(field));
        if (!contributingTile || insightPrefs[contributingTile.key as InsightPrefKey] !== false) {
          activeFieldRisks[field] = level;
        }
      }
    }

    return { tiles: activeTiles, fieldRisks: activeFieldRisks };
  }, [rawInsights, insightPrefs]);

  function handleVerdict(key: LabelType, displayName: string) {
    onVerdict(currentItem.id, key, displayName);
  }

  function handleValidate() {
    if (isLast) {
      onExit();
    } else {
      onNext();
    }
  }

  return (
    <div className={`flex flex-col h-full bg-white overflow-hidden ${isStandalone ? "" : "absolute inset-0 z-50 animate-in slide-in-from-bottom-2 duration-200"}`}>
      {/* ── GLOBAL TOP NAVIGATION BAR (overlay mode only — standalone uses AppShell Topbar) ── */}
      {!isStandalone && (
        <header className="flex h-12 items-center justify-between border-b border-neutral-100 px-4 shrink-0 bg-white">
          {/* Left: Sidebar Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-neutral-900 transition-colors"
              onClick={onExit}
            >
              <RiSidebarFoldLine className="size-4" />
            </Button>
            <div className="w-px h-4 bg-neutral-200" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/explore" className="text-[14px] text-neutral-500 hover:text-neutral-900 transition-colors">
                    Explore
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-neutral-400" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/explore" className="text-[14px] text-neutral-500 hover:text-neutral-900 transition-colors">
                    Posts
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-neutral-400" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[14px] font-medium text-neutral-900 tracking-tight">
                    PO#{currentItem.postId}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Organization Switcher */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 gap-2 border-neutral-200 px-3 text-[13px] font-medium text-neutral-700 shadow-sm"
                >
                  <RiBuildingLine size={14} className="text-neutral-400" />
                  {SUB_ORGANIZATIONS[0].name}
                  <RiArrowDownSLine size={14} className="text-neutral-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                {SUB_ORGANIZATIONS.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    className="flex cursor-pointer items-center justify-between text-[13px]"
                  >
                    <span>{org.name}</span>
                    {org.count !== null && (
                      <span className="tabular-nums text-neutral-400">
                        {org.count.toLocaleString("en-US")}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      )}

      {/* ── ENTITY HEADER (matches Website view) ── */}
      <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0">
        {/* Left: Status, ID, Date + Batch nav */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 bg-green-500 rounded-full" />
            <span className="text-[11px] text-neutral-500">Online</span>
          </div>
          <span className="text-lg font-bold text-neutral-900">
            PO#{currentItem.postId}
          </span>
          <span className="text-[11px] text-neutral-400">
            {currentItem.crawlingDate}
          </span>
          {/* Batch navigation */}
          {isBatch && (
            <>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400">
                  {currentIndex + 1}/{queue.length}
                </span>
                <div className="w-20 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 border-neutral-200"
                  onClick={onPrev}
                  disabled={isFirst}
                >
                  <RiArrowLeftSLine className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 border-neutral-200"
                  onClick={onNext}
                  disabled={isLast}
                >
                  <RiArrowRightSLine className="w-3.5 h-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Right: Actions Group */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-help hover:text-neutral-800 transition-colors group mr-2">
            <div className="flex items-center gap-1 underline decoration-dashed decoration-neutral-300 underline-offset-4 group-hover:decoration-neutral-400 transition-colors">
              <RiInformationLine className="size-3 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
              <span>Validated by moderator</span>
            </div>
            <div className="flex">
              <RiCheckLine className="size-3.5 text-emerald-500 -mr-1" />
              <RiCheckLine className="size-3.5 text-emerald-500" />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8 text-xs"
          >
            <RiMessage3Line className="size-3.5" />
            Comments
            <Badge
              variant="secondary"
              className="text-[9px] px-1 py-0 bg-neutral-200 ml-0.5"
            >
              3
            </Badge>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8 text-xs text-neutral-600"
          >
            <RiNodeTree className="size-3.5" />
            Rules
          </Button>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`h-8 text-xs px-3 rounded-md gap-1 ${
                  VERDICT_TRIGGER_STYLE[currentItem.label] ?? VERDICT_TRIGGER_STYLE.unlabeled
                }`}
              >
                {currentItem.labelText}
                <RiArrowDownSLine className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {VERDICT_OPTIONS.map((opt) => {
                const isActive = currentItem.label === opt.key;
                return (
                  <DropdownMenuItem
                    key={opt.key}
                    onSelect={() => handleVerdict(opt.key, opt.name)}
                    className="text-xs flex items-center gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${opt.color}`} />
                    {opt.name}
                    {isActive && <RiCheckLine className="h-3.5 w-3.5 text-blue-600 ml-auto" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            className="bg-neutral-900 hover:bg-neutral-800 text-white h-8 text-xs px-4 rounded-md"
            onClick={handleValidate}
          >
            {isLast ? "Enforce & Close" : "Enforce"}
          </Button>

          <Button variant="ghost" size="icon" className="size-8 p-0" onClick={onExit}>
            <RiMoreLine className="size-4 text-neutral-500" />
          </Button>
        </div>
      </header>

      {/* ── QUICK CONTEXT RISK BAR ── */}
      {insights.tiles.length > 0 && (
        <div className="flex items-center gap-3 px-6 py-2.5 border-b border-neutral-200 bg-neutral-50 shrink-0 overflow-x-auto custom-scrollbar">
          {insights.tiles.map((tile, i) => {
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
                  Select which risk signals are most critical for your current moderation queue.
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

      {/* ── MAIN CONTENT GRID ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Media Investigation Viewer */}
        <div className="flex-1 p-4 flex flex-col gap-2 border-r border-neutral-200 bg-neutral-100 min-w-0 min-h-0 overflow-y-auto">
          {/* Layer 1: Primary Display — hard-locked investigation canvas */}
          <div className="relative w-full aspect-[4/3] shrink-0 bg-neutral-950 rounded-xl">
            {/* Media content (clipped to rounded corners) */}
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              {displayMedia.type === "video" && !activeFrame ? (
                <video
                  ref={videoRef}
                  key={displayMedia.id}
                  src={displayMedia.url}
                  controls
                  className="w-full h-full object-contain bg-neutral-900"
                  onPause={() => setIsVideoPaused(true)}
                  onPlay={() => setIsVideoPaused(false)}
                >
                  {showSubtitles && activeMedia.subtitlesUrl && (
                    <track
                      kind="subtitles"
                      src={activeMedia.subtitlesUrl}
                      srcLang="en"
                      label="English"
                      default
                    />
                  )}
                </video>
              ) : displayMedia.url ? (
                <ImageWithFallback
                  key={displayMedia.id}
                  src={displayMedia.url}
                  className="w-full h-full object-contain transition-all duration-200"
                  alt={currentItem.title}
                  fallbackClassName="w-full h-full"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-500">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center">
                    <RiShieldCheckLine className="w-8 h-8 text-neutral-600" />
                  </div>
                  <span className="text-sm text-neutral-500">No media available</span>
                </div>
              )}
            </div>

            {/* Floating Top-Left: Integrated Action Bar */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              {activeFrame && (
                <button
                  onClick={() => setActiveFrameIndex(null)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-neutral-100 transition-colors hover:bg-white cursor-pointer"
                >
                  <RiArrowLeftSLine className="h-3.5 w-3.5 text-neutral-600" />
                  <span className="text-[10px] font-bold text-neutral-700">
                    Back to Video
                  </span>
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-neutral-100 cursor-pointer hover:bg-white transition-colors">
                    <div className={`w-2 h-2 rounded-full ${mediaLabelDot}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                      {mediaLabelText}
                    </span>
                    <RiArrowDownSLine className="h-3 w-3 text-neutral-400" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  {(["counterfeit", "suspicious", "legitimate", "unlabeled"] as MediaLabel[]).map((label) => (
                    <DropdownMenuItem
                      key={label}
                      onClick={() => handleMediaLabelChange(label)}
                      className={`text-xs font-medium ${currentLabel === label ? "bg-neutral-100" : ""}`}
                    >
                      <div className={`size-2 rounded-full ${MEDIA_LABEL_DOT[label] ?? "bg-neutral-300"}`} />
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                      {currentLabel === label && (
                        <RiCheckLine className="ml-auto h-3.5 w-3.5 text-neutral-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {activeMedia.type === "video" && !activeFrame && activeMedia.subtitlesUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSubtitles((v) => !v); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-sm border backdrop-blur-md transition-colors cursor-pointer ${
                    showSubtitles
                      ? "bg-white/90 border-neutral-100 text-neutral-900"
                      : "bg-black/50 border-white/10 text-white/80 hover:bg-black/60"
                  }`}
                >
                  <RiClosedCaptioningLine className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {showSubtitles ? "CC On" : "CC Off"}
                  </span>
                </button>
              )}
            </div>

            {/* Frame indicator (top-right) */}
            {activeFrame && (
              <div className="absolute top-3 right-3 z-20">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/80 backdrop-blur-sm rounded-full">
                  <RiFilmLine className="h-3 w-3 text-neutral-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-200">
                    Frame {activeFrameIndex! + 1}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Layer 2: Extracted Frames Strip (video paused only) */}
          {showFrameStrip && (
            <div className="flex flex-col gap-1.5 rounded-lg bg-neutral-900 p-2">
              <div className="flex items-center gap-1.5 px-1">
                <RiFilmLine className="h-3 w-3 text-neutral-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Auto-Extracted Video Frames
                </span>
                <span className="text-[10px] tabular-nums text-neutral-500">
                  {activeMedia.frames!.length}
                </span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {activeMedia.frames!.map((frame, fi) => {
                  const fdot = MEDIA_LABEL_DOT[resolveLabel(frame)] ?? "bg-neutral-300";
                  return (
                    <div
                      key={frame.id}
                      onClick={() => setActiveFrameIndex(fi)}
                      className={`relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-md bg-neutral-800 transition-all duration-150 hover:scale-105 ${
                        activeFrameIndex === fi
                          ? "border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                          : "border border-neutral-700 hover:border-neutral-500"
                      }`}
                    >
                      <ImageWithFallback
                        src={frame.url}
                        alt={frame.id}
                        className="h-full w-full object-cover"
                        fallbackClassName="h-full w-full"
                      />
                      <div className={`absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full ring-1 ring-neutral-900 ${fdot}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Layer 3: Post Media Timeline Strip */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {currentItem.media.map((m, i) => {
              const isActive = i === activeMediaIndex;
              const mdot = MEDIA_LABEL_DOT[resolveLabel(m)] ?? "bg-neutral-300";
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMedia(i)}
                  className={`relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-md bg-white transition-all duration-150 ${
                    isActive
                      ? "border-2 border-blue-600 shadow-md"
                      : "border border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {m.type === "video" ? (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-800">
                      <RiPlayFill className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <ImageWithFallback
                      src={m.url}
                      alt={m.id}
                      className="h-full w-full object-cover"
                      fallbackClassName="h-full w-full"
                    />
                  )}
                  <div className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ring-1 ring-white ${mdot}`} />
                </div>
              );
            })}
          </div>

          {/* Suspicious Reasons */}
          {currentItem.suspiciousCount > 0 && (
            <div className="p-3 bg-white rounded-lg border border-neutral-200">
              <div className="flex items-center gap-2 mb-1.5">
                <RiAlertLine className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-bold uppercase text-neutral-400">
                  Suspicious Reasons ({currentItem.suspiciousCount})
                </span>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {currentItem.suspiciousReasons}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Sidebar */}
        <aside className="w-[450px] shrink-0 bg-white flex flex-col">
          <Tabs defaultValue="overview" className="flex flex-col flex-1 min-h-0">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-neutral-200 bg-white h-12 px-4 shrink-0">
              <TabsList
                variant="line"
                className="flex gap-6 bg-transparent rounded-none h-full w-auto p-0"
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
              <TabsContent value="overview" className="p-5 space-y-6 pb-20 m-0">
                {/* Post Intelligence */}
                <section>
                  <SectionHeader icon={RiShieldCheckLine} label="Post Intelligence" />
                  <div className="mb-4">
                    <h2 className="text-base font-bold text-neutral-900 leading-tight">
                      {currentItem.title}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      {insights.fieldRisks["Price"] ? (
                        <span className={`text-lg ${RISK_VALUE_STYLES[insights.fieldRisks["Price"]]}`}>
                          {currentItem.price}
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-neutral-900">{currentItem.price}</span>
                      )}
                      <span className="text-sm font-semibold text-blue-500">{currentItem.pricePct}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Listed Brand" value={currentItem.listedBrand} />
                    <DataPoint label="Category" value={currentItem.productCategory} />
                    <DataPoint label="Impact Score" value={`${currentItem.impactScore}/100`} risk={insights.fieldRisks["Impact Score"]} />
                    <DataPoint label="Stock" value={currentItem.stock} />
                  </div>
                </section>

                {/* Seller Intelligence */}
                <section>
                  <SectionHeader icon={RiUserLine} label="Seller Intelligence" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Account Name" value={currentItem.accountName} risk={insights.fieldRisks["Account Name"]} />
                    <DataPoint label="Account Tag" value={currentItem.accountTag} risk={insights.fieldRisks["Account Tag"]} />
                    <DataPoint label="Account Geo" value={currentItem.accountGeo} />
                    <DataPoint label="Volume Sold" value={currentItem.volumeSold.toLocaleString("en-US")} />
                  </div>
                </section>

                {/* Location & Shipping */}
                <section>
                  <SectionHeader icon={RiMapPinLine} label="Location & Shipping" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Platform Geo" value={currentItem.platformGeo} risk={insights.fieldRisks["Platform Geo"]} />
                    <DataPoint label="Ships From" value={currentItem.shipsFrom} risk={insights.fieldRisks["Ships From"]} />
                  </div>
                  {currentItem.shipsTo.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[10px] text-neutral-500 mb-1.5">Ships To</div>
                      <div className="flex flex-wrap gap-1">
                        {currentItem.shipsTo.map((c) => (
                          <Badge key={c} variant="outline" className="text-[10px] font-normal bg-neutral-50 text-neutral-600">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Product Details */}
                <section>
                  <SectionHeader icon={RiBoxingLine} label="Product Details" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Website" value={currentItem.websiteDomain} isLink />
                    <DataPoint label="Bundle Items" value={String(currentItem.bundleItems)} />
                  </div>
                </section>

                {/* Tags */}
                {currentItem.tags && currentItem.tags.length > 0 && (
                  <section>
                    <SectionHeader icon={RiShieldLine} label="Tags" />
                    <div className="flex flex-wrap gap-1.5">
                      {currentItem.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="h-6 px-2 py-0 text-[11px] font-medium bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-sm shadow-none"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Activity & Behaviour */}
                <section>
                  <SectionHeader icon={RiPulseLine} label="Activity & Behaviour" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Post ID" value={currentItem.postId} />
                    <DataPoint label="Crawling Date" value={currentItem.crawlingDate} />
                    <DataPoint label="Last Created" value={currentItem.lastCreatedDate} />
                    {currentItem.takedownDate && (
                      <DataPoint label="Takedown Date" value={currentItem.takedownDate} />
                    )}
                  </div>
                </section>
              </TabsContent>

              {/* ── Details Tab ── */}
              <TabsContent value="details" className="p-5 space-y-6 pb-20 m-0">
                {/* Website & Domain */}
                <section>
                  <SectionHeader icon={RiGlobalLine} label="Website & Domain" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Full URL" value={currentItem.website} isLink />
                    <DataPoint label="Domain" value={currentItem.websiteDomain} />
                    <DataPoint label="IP Certificate" value={currentItem.ipCertificate} />
                    <DataPoint label="Website Category" value={currentItem.websiteCategory} />
                    <DataPoint label="Domain Count" value={String(currentItem.domainCount)} />
                  </div>
                </section>

                {/* Account Details */}
                <section>
                  <SectionHeader icon={RiUserLine} label="Account Details" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Account Name" value={currentItem.accountName} />
                    <DataPoint label="Account Tag" value={currentItem.accountTag} />
                    <DataPoint label="Account Geo" value={currentItem.accountGeo} />
                  </div>
                </section>

                {/* Sales & Inventory */}
                <section>
                  <SectionHeader icon={RiPriceTag3Line} label="Sales & Inventory" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Bundle Items" value={String(currentItem.bundleItems)} />
                    <DataPoint label="Volume Sold" value={currentItem.volumeSold.toLocaleString("en-US")} />
                    <DataPoint label="Stock" value={currentItem.stock} />
                    <DataPoint label="Validation Errors" value={currentItem.validationErrors} />
                  </div>
                </section>

                {/* Image Analysis */}
                {currentItem.imageReasons && (
                  <section>
                    <SectionHeader icon={RiFilmLine} label="Image Analysis" />
                    <div className="grid grid-cols-1 gap-y-5">
                      <DataPoint label="Image Reasons" value={currentItem.imageReasons} />
                    </div>
                  </section>
                )}
              </TabsContent>

              {/* ── Activity Tab ── */}
              <TabsContent value="activity" className="p-5 pb-20 m-0">
                <Select defaultValue="all">
                  <SelectTrigger className="h-8 text-xs w-[180px] mb-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Activity</SelectItem>
                    <SelectItem value="validations" className="text-xs">Validations</SelectItem>
                    <SelectItem value="enforcement" className="text-xs">Enforcement</SelectItem>
                    <SelectItem value="system" className="text-xs">System</SelectItem>
                  </SelectContent>
                </Select>

                <TimelineGroup
                  date={currentItem.crawlingDate}
                  items={[
                    {
                      icon: RiCheckDoubleLine,
                      iconColor: "text-green-500",
                      action: `Validated as ${currentItem.labelText}`,
                      detail: "by moderator",
                      time: "08:42",
                    },
                    {
                      icon: RiShieldLine,
                      iconColor: "text-red-500",
                      action: `Label set to ${currentItem.labelText}`,
                      detail: "Automatic classification",
                      time: "08:42",
                    },
                    {
                      icon: RiTimeLine,
                      iconColor: "text-neutral-500",
                      action: "Post crawled successfully",
                      detail: "200 OK — 1.2s response time",
                      time: "08:41",
                    },
                  ]}
                />

                <TimelineGroup
                  date={currentItem.lastCreatedDate}
                  items={[
                    {
                      icon: RiShieldLine,
                      iconColor: "text-orange-500",
                      action: "Flagged as Suspicious",
                      detail: "ML confidence: 0.89",
                      time: "14:23",
                    },
                    {
                      icon: RiTimeLine,
                      iconColor: "text-neutral-500",
                      action: "Initial crawl completed",
                      detail: "200 OK — 0.8s response time",
                      time: "14:22",
                    },
                    {
                      icon: RiGlobalLine,
                      iconColor: "text-blue-500",
                      action: "Post first detected",
                      detail: "Added to monitoring queue",
                      time: "14:20",
                    },
                  ]}
                />
              </TabsContent>

              {/* ── Network Tab ── */}
              <TabsContent value="network" className="m-0 p-5 pb-20">
                <SectionHeader icon={RiNodeTree} label="Related Entities" />
                <div className="space-y-3">
                  {[
                    { type: "Website", name: currentItem.websiteDomain, count: currentItem.domainCount },
                    { type: "Seller", name: currentItem.accountName, count: "1 account" },
                  ].map((entity) => (
                    <div
                      key={entity.type}
                      className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center">
                          {entity.type === "Website" ? (
                            <RiGlobalLine className="size-3.5 text-neutral-500" />
                          ) : (
                            <RiUserLine className="size-3.5 text-neutral-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-[12px] font-medium text-neutral-900">{entity.name}</div>
                          <div className="text-[10px] text-neutral-500">{entity.type}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-neutral-200">
                        {entity.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
