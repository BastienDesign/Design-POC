"use client";

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
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { ExplorePost } from "@/lib/mock-data";

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
  counterfeit: "bg-red-600 hover:bg-red-700 text-white",
  suspicious: "bg-amber-500 hover:bg-amber-600 text-white",
  legitimate: "bg-emerald-600 hover:bg-emerald-700 text-white",
  unlabeled: "bg-neutral-600 hover:bg-neutral-700 text-white",
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
  if (!post) return null;

  const labelStyle = LABEL_BUTTON_STYLES[post.label] ?? LABEL_BUTTON_STYLES.unlabeled;
  const stockStyle = STOCK_STYLES[post.stock] ?? "border-neutral-200 bg-neutral-50 text-neutral-500";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()} modal={false}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col border-l border-neutral-200 p-0 shadow-2xl sm:max-w-[550px]"
      >
        {/* ─── Sticky Header ─── */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-neutral-500 hover:bg-neutral-100"
              onClick={onClose}
            >
              <RiCloseLine className="h-5 w-5" />
            </Button>
            <div className="h-4 w-px shrink-0 bg-neutral-200" />
            <span className="whitespace-nowrap text-sm font-semibold text-neutral-900">
              PO#{post.postId}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex shrink-0 items-center rounded-md bg-neutral-100 p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-sm bg-white text-neutral-500 shadow-sm hover:text-neutral-900"
                onClick={onPrev}
                disabled={currentIndex === 0}
              >
                <RiArrowLeftSLine className="h-4 w-4" />
              </Button>
              <span className="whitespace-nowrap px-2 text-xs font-medium tabular-nums text-neutral-500">
                {currentIndex + 1} / {totalCount}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-sm text-neutral-500 hover:text-neutral-900"
                onClick={onNext}
                disabled={currentIndex === totalCount - 1}
              >
                <RiArrowRightSLine className="h-4 w-4" />
              </Button>
            </div>
            <Button className={`h-8 shrink-0 whitespace-nowrap text-xs ${labelStyle}`}>
              {post.labelText}
              <RiArrowDownSLine className="ml-1 h-4 w-4 shrink-0" />
            </Button>
          </div>
        </div>

        {/* ─── Scrollable Body (Zero-Scroll Optimized) ─── */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-white p-4">
          {/* MEDIA: 16:9 Hero + Tiny Thumbnails */}
          <div className="flex shrink-0 flex-col gap-1.5">
            <HoverCard openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div className="group relative h-[180px] w-full cursor-zoom-in overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
                  <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400 transition-opacity duration-200 group-hover:opacity-80">
                    Product Image
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent
                side="left"
                align="start"
                sideOffset={24}
                className="z-[100] h-[450px] w-[450px] overflow-hidden rounded-xl border border-neutral-200 bg-white p-0 shadow-2xl"
              >
                <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
                  Large Product Preview
                </div>
              </HoverCardContent>
            </HoverCard>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-9 w-9 shrink-0 cursor-pointer rounded border bg-neutral-100 transition-colors ${
                    i === 0
                      ? "border-neutral-900"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* META: Full Title & Inline Badges */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <a
                href="#"
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
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
            <h3 className="text-base font-semibold leading-snug text-neutral-900">
              {post.title}
            </h3>
            <p className="text-xs leading-relaxed text-neutral-500">
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
            <span className="px-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Insights
            </span>
            <div className="divide-y divide-neutral-100 rounded-md border border-neutral-200 bg-white shadow-sm">
              {/* Price */}
              <div className="flex items-start gap-3 p-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-500">
                  <RiMoneyDollarCircleLine className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900">Price Analysis</span>
                    <span className="text-xs font-mono text-neutral-900">{post.price}</span>
                  </div>
                  <p className="text-[10px] leading-tight text-neutral-500">
                    {post.pricePct} of market average. Volume sold: {post.volumeSold.toLocaleString()} units.
                  </p>
                </div>
              </div>

              {/* Suspicious Signals */}
              <div className="flex items-start gap-3 p-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  post.suspiciousCount > 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                }`}>
                  {post.suspiciousCount > 0 ? (
                    <RiErrorWarningLine className="h-3.5 w-3.5" />
                  ) : (
                    <RiCheckLine className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900">Suspicious Signals</span>
                    <span className="text-xs font-mono text-neutral-900">{post.suspiciousCount}</span>
                  </div>
                  <p className="truncate text-[10px] leading-tight text-neutral-500">
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
                    <span className="text-xs font-semibold text-neutral-900">IP Certificate</span>
                  </div>
                  <p className="text-[10px] leading-tight text-neutral-500">{post.ipCertificate}</p>
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
                    <span className="text-xs font-semibold text-neutral-900">Validation</span>
                  </div>
                  <p className="text-[10px] leading-tight text-neutral-500">
                    {post.validationErrors === "None" ? "All validation checks passed." : post.validationErrors}
                  </p>
                </div>
              </div>

              {/* Geography */}
              <div className="flex items-start gap-3 p-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <RiMapPinLine className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900">Geography</span>
                  </div>
                  <p className="text-[10px] leading-tight text-neutral-500">
                    Ships from {post.shipsFrom}. Account: {post.accountGeo}. Platform: {post.platformGeo}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE: 1-Row Data Bar */}
          <div className="flex flex-col gap-2 pb-2">
            <span className="px-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Timeline
            </span>
            <div className="flex items-center divide-x divide-neutral-200 rounded-md border border-neutral-200 bg-neutral-50 p-3">
              <div className="flex flex-1 flex-col px-2 first:pl-1">
                <span className="mb-0.5 text-[9px] uppercase text-neutral-500">Crawled</span>
                <span className="text-xs font-medium tabular-nums text-neutral-900">
                  {formatShortDate(post.crawlingDate)}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-2">
                <span className="mb-0.5 text-[9px] uppercase text-neutral-500">Created</span>
                <span className="text-xs font-medium tabular-nums text-neutral-900">
                  {formatShortDate(post.lastCreatedDate)}
                </span>
              </div>
              <div className="flex flex-1 flex-col px-2">
                <span className="mb-0.5 text-[9px] uppercase text-neutral-500">Since Mod</span>
                <span className="text-xs font-medium tabular-nums text-neutral-900">
                  {post.daysSinceModeration}d
                </span>
              </div>
              <div className="flex flex-1 flex-col px-2 pr-1">
                <span className="mb-0.5 text-[9px] uppercase text-neutral-500">Takedown</span>
                <span className="text-xs font-medium tabular-nums text-neutral-900">
                  {post.daysSinceTakedown !== null ? `${post.daysSinceTakedown}d ago` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sticky Footer ─── */}
        <div className="flex shrink-0 items-center justify-between border-t border-neutral-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <span>
              Impact:{" "}
              <span
                className={`font-semibold ${
                  post.impactScore >= 80
                    ? "text-red-600"
                    : post.impactScore >= 50
                      ? "text-amber-600"
                      : "text-emerald-600"
                }`}
              >
                {post.impactScore}/100
              </span>
            </span>
            <div className="h-3 w-px bg-neutral-200" />
            <span>
              Bundle: <span className="font-semibold text-neutral-900">{post.bundleItems} items</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 border-neutral-200 text-xs font-medium"
            >
              Open full view
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
