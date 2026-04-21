"use client";

import { useState, useEffect, useRef } from "react";
import {
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiExternalLinkLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiAlertLine,
  RiShieldCheckLine,
  RiMoneyDollarCircleLine,
  RiMapPinLine,
  RiPlayFill,
  RiFilmLine,
  RiClosedCaptioningLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { ExplorePost, PostMedia } from "@/lib/mock-data";
import { ImageWithFallback } from "./image-with-fallback";

interface PostSidePanelProps {
  post: ExplorePost | null;
  open: boolean;
  onClose: () => void;
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
}

const LABEL_BUTTON_STYLES: Record<string, string> = {
  counterfeit: "bg-destructive hover:bg-destructive text-primary-foreground",
  suspicious: "bg-amber-500 hover:bg-amber-600 text-primary-foreground",
  legitimate: "bg-emerald-600 hover:bg-emerald-700 text-primary-foreground",
  unlabeled: "bg-muted-foreground hover:bg-foreground/80 text-primary-foreground",
};

const MEDIA_LABEL_DOT: Record<string, string> = {
  counterfeit: "bg-destructive/100",
  suspicious: "bg-amber-500",
  legitimate: "bg-emerald-500",
  unlabeled: "bg-muted-foreground/60",
};

const STOCK_STYLES: Record<string, string> = {
  "In Stock": "border-emerald-200 bg-emerald-50 text-emerald-600",
  "Low Stock": "border-amber-200 bg-amber-50 text-amber-600",
};

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function PostSidePanel({
  post,
  open,
  onClose,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
}: PostSidePanelProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeFrame, setActiveFrame] = useState<PostMedia | null>(null);
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset state when navigating to a different post
  useEffect(() => {
    setActiveMediaIndex(0);
    setActiveFrame(null);
    setIsVideoPaused(true);
    setShowSubtitles(false);
  }, [post?.id]);

  if (!post) return null;

  const activeMedia = post.media[activeMediaIndex] ?? post.media[0];
  // If a frame is selected, it overrides the display
  const displayMedia = activeFrame ?? activeMedia;
  const displayLabel = displayMedia.label;
  const labelStyle = LABEL_BUTTON_STYLES[displayLabel] ?? LABEL_BUTTON_STYLES.unlabeled;
  const stockStyle = STOCK_STYLES[post.stock] ?? "border-border bg-accent text-muted-foreground";

  function handleSelectMedia(index: number) {
    setActiveMediaIndex(index);
    setActiveFrame(null);
    setIsVideoPaused(true);
  }

  function handleSelectFrame(frame: PostMedia) {
    setActiveFrame(frame);
  }

  const showFrameStrip =
    activeMedia.type === "video" &&
    isVideoPaused &&
    activeMedia.frames &&
    activeMedia.frames.length > 0 &&
    !activeFrame;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()} modal={false}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col border-l border-border p-0 shadow-2xl sm:max-w-[550px]"
      >
        {/* Accessibility: visually hidden title for screen readers */}
        <SheetHeader className="sr-only">
          <SheetTitle>Post Details</SheetTitle>
        </SheetHeader>

        {/* ─── Sticky Header ─── */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted"
              onClick={onClose}
            >
              <RiCloseLine className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-4 bg-secondary" />
            <span className="whitespace-nowrap text-sm font-semibold text-foreground">
              PO#{post.postId}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex shrink-0 items-center rounded-md bg-muted p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-sm bg-card text-muted-foreground shadow-sm hover:text-foreground"
                onClick={onPrev}
                disabled={currentIndex === 0}
              >
                <RiArrowLeftSLine className="h-4 w-4" />
              </Button>
              <span className="whitespace-nowrap px-2 text-xs font-medium tabular-nums text-muted-foreground">
                {currentIndex + 1} / {totalCount}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-sm text-muted-foreground hover:text-foreground"
                onClick={onNext}
                disabled={currentIndex === totalCount - 1}
              >
                <RiArrowRightSLine className="h-4 w-4" />
              </Button>
            </div>
            {/* Per-media label badge */}
            <Button className={`h-8 shrink-0 whitespace-nowrap text-xs ${labelStyle}`}>
              {displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1)}
              <RiArrowDownSLine className="ml-1 h-4 w-4 shrink-0" />
            </Button>
          </div>
        </div>

        {/* ─── Scrollable Body ─── */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-card p-4">
          {/* MEDIA PLAYER */}
          <div className="flex shrink-0 flex-col gap-1.5">
            {/* Primary Display */}
            {displayMedia.type === "video" && !activeFrame ? (
              <div className="relative h-[180px] w-full overflow-hidden rounded-md border border-border bg-foreground">
                <video
                  ref={videoRef}
                  key={displayMedia.id}
                  src={displayMedia.url}
                  controls
                  className="h-full w-full object-contain"
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
                {/* CC Toggle */}
                {activeMedia.subtitlesUrl && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSubtitles((v) => !v); }}
                    className={`absolute top-2 right-2 z-50 pointer-events-auto flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm border transition-colors cursor-pointer ${
                      showSubtitles
                        ? "bg-card border-border text-foreground"
                        : "bg-foreground/60 backdrop-blur-sm border-foreground/20 text-muted-foreground hover:bg-foreground/80"
                    }`}
                  >
                    <RiClosedCaptioningLine className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">CC</span>
                  </button>
                )}
              </div>
            ) : (
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div className="group relative h-[180px] w-full cursor-zoom-in overflow-hidden rounded-md border border-border bg-muted">
                    <ImageWithFallback
                      src={displayMedia.url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-all duration-200 group-hover:opacity-80"
                      fallbackClassName="h-full w-full"
                    />
                    {/* Frame indicator badge */}
                    {activeFrame && (
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-foreground/80 px-2.5 py-1 backdrop-blur-sm">
                        <RiFilmLine className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/90">
                          Extracted Frame
                        </span>
                      </div>
                    )}
                  </div>
                </HoverCardTrigger>
                <HoverCardContent
                  side="left"
                  align="start"
                  sideOffset={24}
                  className="z-[100] h-[450px] w-[450px] overflow-hidden rounded-xl border border-border bg-card p-0 shadow-2xl"
                >
                  <ImageWithFallback
                    src={displayMedia.url}
                    alt={post.title}
                    className="h-full w-full object-contain"
                    fallbackClassName="h-full w-full"
                  />
                </HoverCardContent>
              </HoverCard>
            )}

            {/* Extracted Frames Strip (Video paused state) */}
            {showFrameStrip && (
              <div className="flex flex-col gap-1.5 rounded-lg bg-foreground p-2">
                <div className="flex items-center gap-1.5 px-1">
                  <RiFilmLine className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Extracted Frames
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {activeMedia.frames!.length}
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {activeMedia.frames!.map((frame) => {
                    const dotColor = MEDIA_LABEL_DOT[frame.label] ?? "bg-muted-foreground/60";
                    return (
                      <div
                        key={frame.id}
                        onClick={() => handleSelectFrame(frame)}
                        className="group/frame relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-md border border-foreground/20 bg-foreground/90 transition-all duration-150 hover:border-muted-foreground"
                      >
                        <ImageWithFallback
                          src={frame.url}
                          alt={frame.id}
                          className="h-full w-full object-cover"
                          fallbackClassName="h-full w-full"
                        />
                        <div className={`absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full ring-1 ring-foreground ${dotColor}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Back to video button when viewing a frame */}
            {activeFrame && activeMedia.type === "video" && (
              <button
                onClick={() => setActiveFrame(null)}
                className="flex items-center gap-1.5 self-start rounded-md bg-muted px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <RiArrowLeftSLine className="h-3.5 w-3.5" />
                Back to video
              </button>
            )}

            {/* Media Timeline (Post-level thumbnails) */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {post.media.map((m, i) => {
                const isActive = i === activeMediaIndex && !activeFrame;
                const dotColor = MEDIA_LABEL_DOT[m.label] ?? "bg-muted-foreground/60";
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMedia(i)}
                    className={`relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-md bg-muted transition-all duration-150 ${
                      isActive
                        ? "border-2 border-primary shadow-md"
                        : "border border-border hover:border-border"
                    }`}
                  >
                    {m.type === "video" ? (
                      <div className="flex h-full w-full items-center justify-center bg-foreground/90">
                        <RiPlayFill className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    ) : (
                      <ImageWithFallback
                        src={m.url}
                        alt={m.id}
                        className="h-full w-full object-cover"
                        fallbackClassName="h-full w-full"
                      />
                    )}
                    {/* Label dot indicator */}
                    <div className={`absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-background ${dotColor}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* META: Full Title & Inline Badges */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <a
                href="#"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <RiExternalLinkLine className="h-3.5 w-3.5" />
                {post.websiteDomain}
              </a>
              <Badge
                variant="outline"
                className={`h-4 rounded-sm px-1.5 py-0 text-[9px] uppercase ${stockStyle}`}
              >
                {post.stock}
              </Badge>
            </div>
            <h3 className="text-base font-semibold leading-snug text-foreground">
              {post.title}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Listed by {post.accountName} on {post.websiteDomain}. Ships from{" "}
              {post.shipsFrom} to {post.shipsTo.slice(0, 2).join(", ")}
              {post.shipsTo.length > 2 && ` +${post.shipsTo.length - 2}`}.
            </p>
            <div className="mt-0.5 flex flex-wrap gap-1">
              <Badge variant="secondary" className="h-4 rounded-sm px-1.5 py-0 text-[9px] font-normal">
                {post.productCategory}
              </Badge>
              <Badge variant="secondary" className="h-4 rounded-sm px-1.5 py-0 text-[9px] font-normal">
                {post.listedBrand}
              </Badge>
              <Badge variant="secondary" className="h-4 rounded-sm px-1.5 py-0 text-[9px] font-normal">
                {post.websiteCategory}
              </Badge>
              <Badge variant="secondary" className="h-4 rounded-sm px-1.5 py-0 text-[9px] font-normal">
                {post.platformGeo}
              </Badge>
            </div>
          </div>

          {/* INSIGHTS: Single Bordered List */}
          <div className="flex flex-col gap-2">
            <span className="px-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Insights
            </span>
            <div className="divide-y divide-border rounded-md border border-border bg-card shadow-sm">
              {/* Price */}
              <div className="flex items-start gap-3 p-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                  <RiMoneyDollarCircleLine className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Price Analysis</span>
                    <span className="text-xs font-mono text-foreground">{post.price}</span>
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    {post.pricePct} of market average. Volume sold: {post.volumeSold.toLocaleString("en-US")} units.
                  </p>
                </div>
              </div>

              {/* Suspicious Signals */}
              <div className="flex items-start gap-3 p-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  post.suspiciousCount > 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-50 text-emerald-500"
                }`}>
                  {post.suspiciousCount > 0 ? (
                    <RiErrorWarningLine className="h-3.5 w-3.5" />
                  ) : (
                    <RiCheckLine className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Suspicious Signals</span>
                    <span className="text-xs font-mono text-foreground">{post.suspiciousCount}</span>
                  </div>
                  <p className="truncate text-[10px] leading-tight text-muted-foreground">
                    {post.suspiciousReasons || "No suspicious signals detected."}
                  </p>
                </div>
              </div>

              {/* IP Certificate */}
              <div className="flex items-start gap-3 p-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <RiShieldCheckLine className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">IP Certificate</span>
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">{post.ipCertificate}</p>
                </div>
              </div>

              {/* Validation */}
              <div className="flex items-start gap-3 p-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  post.validationErrors === "None" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                }`}>
                  {post.validationErrors === "None" ? (
                    <RiCheckLine className="h-3.5 w-3.5" />
                  ) : (
                    <RiAlertLine className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Validation</span>
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    {post.validationErrors === "None" ? "All validation checks passed." : post.validationErrors}
                  </p>
                </div>
              </div>

              {/* Geography */}
              <div className="flex items-start gap-3 p-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <RiMapPinLine className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Geography</span>
                  </div>
                  <p className="text-[10px] leading-tight text-muted-foreground">
                    Ships from {post.shipsFrom}. Account: {post.accountGeo}. Platform: {post.platformGeo}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE: 1-Row Data Bar */}
          <div className="flex flex-col gap-2 pb-2">
            <span className="px-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Timeline
            </span>
            <div className="flex items-center divide-x divide-border rounded-md border border-border bg-accent p-3">
              <div className="flex flex-1 flex-col px-2 first:pl-1">
                <span className="mb-0.5 text-[9px] uppercase text-muted-foreground">Crawled</span>
                <span className="text-xs font-medium tabular-nums text-foreground">
                  {formatShortDate(post.crawlingDate)}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-2">
                <span className="mb-0.5 text-[9px] uppercase text-muted-foreground">Created</span>
                <span className="text-xs font-medium tabular-nums text-foreground">
                  {formatShortDate(post.lastCreatedDate)}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-2">
                <span className="mb-0.5 text-[9px] uppercase text-muted-foreground">Since Mod</span>
                <span className="text-xs font-medium tabular-nums text-foreground">
                  {post.daysSinceModeration}d
                </span>
              </div>
              <div className="flex flex-1 flex-col px-2 pr-1">
                <span className="mb-0.5 text-[9px] uppercase text-muted-foreground">Takedown</span>
                <span className="text-xs font-medium tabular-nums text-foreground">
                  {post.daysSinceTakedown !== null ? `${post.daysSinceTakedown}d ago` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sticky Footer ─── */}
        <div className="flex shrink-0 items-center justify-between border-t border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Impact:{" "}
              <span
                className={`font-semibold ${
                  post.impactScore >= 80
                    ? "text-destructive"
                    : post.impactScore >= 50
                      ? "text-amber-600"
                      : "text-emerald-600"
                }`}
              >
                {post.impactScore}/100
              </span>
            </span>
            <Separator orientation="vertical" className="h-3 bg-secondary" />
            <span>
              Bundle: <span className="font-semibold text-foreground">{post.bundleItems} items</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 border-border text-xs font-medium"
            >
              Open full view
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
