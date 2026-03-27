"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  RiArrowLeftLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiExternalLinkLine,
  RiAlertLine,
  RiAlertFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiMapPinLine,
  RiPriceTag3Line,
  RiShieldCheckLine,
  RiCheckLine,
  RiSettings3Line,
  RiPlayFill,
  RiFilmLine,
  RiClosedCaptioningLine,
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
import type { ExplorePost, LabelType, MediaLabel, PostMedia } from "@/lib/mock-data";
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
] as const;

type InsightPrefKey = (typeof INSIGHT_SIGNALS)[number]["id"];

const DEFAULT_INSIGHT_PREFS: Record<InsightPrefKey, boolean> = {
  priceAnomaly: true,
  accountRisk: true,
  geoMismatch: true,
  highImpact: true,
  highVolume: true,
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
      fields: ["Account"],
    });
    fieldRisks["Account"] = level;
  }

  // Geo mismatch — ships from different region than platform geo
  if (item.shipsFrom.toLowerCase() !== item.platformGeo.toLowerCase()) {
    tiles.push({ key: "geoMismatch", level: "low", label: "Geo Mismatch", desc: `Ships from ${item.shipsFrom}`, icon: RiInformationFill, fields: ["Platform Geo", "Ships From"] });
    fieldRisks["Platform Geo"] = "low";
    fieldRisks["Ships From"] = "low";
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
    tiles.push({ key: "highVolume", level: "medium", label: "High Volume", desc: `${item.volumeSold.toLocaleString()} units sold`, icon: RiErrorWarningFill });
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

interface ModerationWorkspaceProps {
  queue: ExplorePost[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  onVerdict: (postId: string, label: LabelType, labelText: string) => void;
}

export function ModerationWorkspace({
  queue,
  currentIndex,
  onNext,
  onPrev,
  onExit,
  onVerdict,
}: ModerationWorkspaceProps) {
  const currentItem = queue[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === queue.length - 1;
  const isBatch = queue.length > 1;
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
    <div className="flex flex-col h-full bg-neutral-50 absolute inset-0 z-50 animate-in slide-in-from-bottom-2 duration-200">
      {/* ── TOP HEADER: Progress & Verdicts ── */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-neutral-200 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="text-neutral-500 hover:text-neutral-900"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              {isBatch ? "Batch Queue" : "Single Item View"}
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              {isBatch
                ? `${currentIndex + 1} of ${queue.length}`
                : `PO#${currentItem.postId}`}
            </span>
          </div>
          {/* Progress bar — only in batch mode */}
          {isBatch && (
            <div className="w-32 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Navigation — only in batch mode */}
        {isBatch && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-neutral-200"
              onClick={onPrev}
              disabled={isFirst}
            >
              <RiArrowLeftSLine className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-neutral-200"
              onClick={onNext}
              disabled={isLast}
            >
              <RiArrowRightSLine className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Verdict Dropdown + Validate */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`h-9 px-4 text-xs font-semibold rounded-md shadow-sm flex items-center gap-2 transition-all ${
                  VERDICT_TRIGGER_STYLE[currentItem.label] ?? VERDICT_TRIGGER_STYLE.unlabeled
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor} ring-1 ring-white/30`} />
                {currentItem.labelText}
                <RiArrowDownSLine className="w-4 h-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="w-56 p-1"
            >
              {VERDICT_OPTIONS.map((opt) => {
                const isActive = currentItem.label === opt.key;
                return (
                  <DropdownMenuItem
                    key={opt.key}
                    onSelect={() => handleVerdict(opt.key, opt.name)}
                    className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-3 py-2"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${opt.color}`} />
                    <span className="flex-1">{opt.name}</span>
                    {isActive && <RiCheckLine className="h-3.5 w-3.5 text-blue-600" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <Button
            variant="default"
            className="h-9 px-5 bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold"
            onClick={handleValidate}
          >
            {isLast ? "Validate & Close" : "Validate & Next"}
          </Button>
        </div>
      </header>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Media Investigation Viewer */}
        <div className="w-1/2 p-4 flex flex-col gap-2 border-r border-neutral-200 bg-neutral-100 min-h-0 overflow-y-auto">
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
                <img
                  key={displayMedia.id}
                  src={displayMedia.url}
                  className="w-full h-full object-contain transition-all duration-200"
                  alt={currentItem.title}
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
                      <img
                        src={frame.url}
                        alt={frame.id}
                        className="h-full w-full object-cover"
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
                    <img
                      src={m.url}
                      alt={m.id}
                      className="h-full w-full object-cover"
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

        {/* RIGHT PANEL: Data & Tabs */}
        <div className="w-1/2 bg-white flex flex-col">
          <Tabs defaultValue="review" className="flex flex-col flex-1 min-h-0">
            <TabsList className="w-full justify-start rounded-none border-b border-neutral-100 bg-transparent p-0 px-6 h-auto">
              <TabsTrigger
                value="review"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent px-4 py-3 shadow-none text-sm font-medium transition-none capitalize"
              >
                Review
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent px-4 py-3 shadow-none text-sm font-medium transition-none capitalize"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="log"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-neutral-900 data-[state=active]:bg-transparent px-4 py-3 shadow-none text-sm font-medium transition-none capitalize"
              >
                Log
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="review" className="p-6 space-y-6 mt-0">
                {/* ── AI INSIGHTS RIBBON — Horizontally scrollable ── */}
                {insights.tiles.length > 0 && (
                  <div className="flex items-stretch gap-3 overflow-x-auto pb-4 mb-2 -mx-6 px-6 custom-scrollbar">
                    {insights.tiles.map((tile, i) => {
                      const s = RISK_TILE_STYLES[tile.level];
                      return (
                        <div key={i} className={`shrink-0 w-[160px] p-3 rounded-xl border flex flex-col justify-between gap-2 shadow-sm ${s.bg} ${s.border}`}>
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <tile.icon className={`w-3.5 h-3.5 ${s.icon}`} />
                              <span className={`text-[10px] font-bold uppercase tracking-wide ${s.label}`}>
                                {tile.label}
                              </span>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold leading-tight ${s.desc}`}>
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
                          className="shrink-0 h-full min-h-[72px] border border-dashed border-neutral-300 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-xl px-4 flex flex-col gap-1 items-center justify-center transition-colors"
                        >
                          <RiSettings3Line className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase">Prioritize</span>
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

                {/* Title & Price */}
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                    {currentItem.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xl font-bold text-neutral-900">{currentItem.price}</span>
                    <span className="text-sm font-semibold text-blue-500">{currentItem.pricePct}</span>
                  </div>
                </div>

                {/* ── HEATMAP METADATA ROWS ── */}
                <div className="space-y-1.5">
                  {([
                    { label: "Website", value: currentItem.websiteDomain, isLink: true, score: undefined },
                    { label: "Account", value: currentItem.accountName, isLink: false, score: undefined },
                    { label: "Price", value: `${currentItem.price}  ${currentItem.pricePct}`, isLink: false, score: undefined },
                    { label: "Platform Geo", value: currentItem.platformGeo, isLink: false, score: undefined },
                    { label: "Impact Score", value: String(currentItem.impactScore), isLink: false, score: currentItem.impactScore },
                    { label: "Listed Brand", value: currentItem.listedBrand, isLink: false, score: undefined },
                    { label: "Category", value: currentItem.productCategory, isLink: false, score: undefined },
                    { label: "Ships From", value: currentItem.shipsFrom, isLink: false, score: undefined },
                    { label: "Stock", value: currentItem.stock, isLink: false, score: undefined },
                  ]).map((item) => {
                    const risk = insights.fieldRisks[item.label] as RiskLevel | undefined;
                    const rs = risk ? RISK_ROW_STYLES[risk] : null;

                    return (
                      <div
                        key={item.label}
                        className={`flex justify-between items-center py-2 px-3 rounded-lg border transition-colors ${
                          rs
                            ? `${rs.bg} ${rs.border}`
                            : "bg-transparent border-transparent hover:bg-neutral-50 hover:border-neutral-100"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase ${
                          rs ? rs.label : "text-neutral-400"
                        }`}>
                          {item.label}
                        </span>

                        <div className="flex items-center gap-2">
                          {risk === "high" && <RiAlertFill className="w-3.5 h-3.5 text-red-500" />}
                          {risk === "medium" && <RiErrorWarningFill className="w-3.5 h-3.5 text-amber-500" />}
                          {risk === "low" && <RiInformationFill className="w-3.5 h-3.5 text-emerald-500" />}

                          {item.score !== undefined ? (
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${rs ? rs.value : "text-neutral-900"}`}>
                                {item.score}
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.score >= 80 ? "bg-red-500" : item.score >= 50 ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <p className={`text-sm font-medium ${
                              rs ? rs.value :
                              item.isLink ? "text-blue-600" : "text-neutral-900"
                            }`}>
                              {item.isLink ? (
                                <span className="flex items-center gap-1">
                                  {item.value}
                                  <RiExternalLinkLine className="w-3 h-3 shrink-0" />
                                </span>
                              ) : (
                                item.value
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tags */}
                {currentItem.tags && currentItem.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <RiPriceTag3Line className="w-4 h-4 text-neutral-400" />
                      <span className="text-xs font-bold uppercase text-neutral-400">Tags</span>
                    </div>
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
                  </div>
                )}

                {/* Post ID & Dates */}
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Post ID</span>
                    <span className="text-sm font-mono text-neutral-700">{currentItem.postId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Crawling Date</span>
                    <span className="text-sm text-neutral-700">{currentItem.crawlingDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Last Created</span>
                    <span className="text-sm text-neutral-700">{currentItem.lastCreatedDate}</span>
                  </div>
                  {currentItem.takedownDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Takedown Date</span>
                      <span className="text-sm text-neutral-700">{currentItem.takedownDate}</span>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="p-6 mt-0">
                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Full URL</span>
                      <span className="text-sm text-blue-600 truncate max-w-[300px]">{currentItem.website}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">IP Certificate</span>
                      <span className="text-sm text-neutral-700">{currentItem.ipCertificate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Website Category</span>
                      <span className="text-sm text-neutral-700">{currentItem.websiteCategory}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Domain Count</span>
                      <span className="text-sm text-neutral-700">{currentItem.domainCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Account Tag</span>
                      <span className="text-sm text-neutral-700">{currentItem.accountTag}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Account Geo</span>
                      <span className="text-sm text-neutral-700">{currentItem.accountGeo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Bundle Items</span>
                      <span className="text-sm text-neutral-700">{currentItem.bundleItems}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Volume Sold</span>
                      <span className="text-sm text-neutral-700">{currentItem.volumeSold.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Validation</span>
                      <span className="text-sm text-neutral-700">{currentItem.validationErrors}</span>
                    </div>
                    {currentItem.imageReasons && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Image Reasons</span>
                        <span className="text-sm text-neutral-700 truncate max-w-[300px]">{currentItem.imageReasons}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase">Ships To</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentItem.shipsTo.map((c) => (
                          <Badge key={c} variant="outline" className="text-[10px] font-normal bg-neutral-50 text-neutral-600">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="log" className="mt-0">
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                    <RiShieldCheckLine className="w-6 h-6 text-neutral-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-500">Moderation log will appear here</p>
                  <p className="text-xs text-neutral-400 mt-1">Actions taken on this post will be recorded</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
