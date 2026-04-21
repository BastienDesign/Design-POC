"use client";

import {
  RiExternalLinkLine,
  RiErrorWarningLine,
} from "@remixicon/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { ExplorePost, LabelType } from "@/lib/mock-data";
import { ImageWithFallback } from "./image-with-fallback";
import type { PendingChanges } from "./bulk-action-pill";

const LABEL_DOT: Record<string, string> = {
  counterfeit: "bg-destructive/100",
  suspicious: "bg-amber-500",
  legitimate: "bg-emerald-500",
  trademark_infringement: "bg-orange-400",
  "trademark infringement": "bg-orange-400",
  copyright_violation: "bg-purple-500",
  unlabeled: "bg-muted-foreground/60",
};

interface PostGridCardProps {
  post: ExplorePost;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onClick: (id: string) => void;
  pendingChanges?: PendingChanges | null;
}

export function PostGridCard({
  post,
  isSelected,
  onSelect,
  onClick,
  pendingChanges,
}: PostGridCardProps) {
  const staging = isSelected ? pendingChanges : null;
  const displayLabel = staging?.label ?? post.labelText;
  const labelKey = displayLabel.toLowerCase();
  const dotColor = LABEL_DOT[labelKey] ?? "bg-muted-foreground/60";

  const displayCategory = staging?.category ?? post.productCategory;
  const displayTags = staging?.tags ?? post.tags ?? [];

  const impactColor =
    post.impactScore >= 80
      ? "bg-destructive/100"
      : post.impactScore >= 50
        ? "bg-amber-500"
        : "bg-emerald-500";

  const suspiciousReasonsList = post.suspiciousReasons
    ? post.suspiciousReasons.split(", ").filter(Boolean)
    : [];

  return (
    <div
      className={`group relative bg-card border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        isSelected
          ? "border-foreground ring-1 ring-foreground"
          : "border-border"
      }`}
    >
      {/* Top: Image & Overlay Actions */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden border-b border-border">
        <ImageWithFallback
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          fallbackClassName="h-full w-full"
        />

        {/* Checkbox Overlay */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(post.id, checked === true)}
            className="bg-background backdrop-blur-md border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
          />
        </div>

        {/* Label Badge Overlay (Top Right) */}
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-background backdrop-blur-md rounded-full shadow-sm border border-border">
            <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
              {displayLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Content Area */}
      <div className="p-3 space-y-3">
        {/* Title & ID */}
        <div>
          <h4
            className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => onClick(post.id)}
          >
            {post.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              PO#{post.postId}
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-[11px] font-medium text-primary flex items-center gap-0.5 truncate">
              {post.websiteDomain}
              <RiExternalLinkLine className="w-3 h-3 shrink-0" />
            </span>
          </div>
        </div>

        {/* Metrics Row (Price & Impact) */}
        <div className="flex items-center justify-between py-2 border-y border-border">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">
              Price
            </span>
            <span className="text-sm font-bold text-foreground">
              {post.price}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight text-right">
              Impact Score
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {post.impactScore}
              </span>
              <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${impactColor}`}
                  style={{ width: `${post.impactScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Reasons & Tags */}
        <div className="flex items-center justify-between">
          {/* Suspicious Reasons (Icons only for density) */}
          <div className="flex -space-x-1">
            {suspiciousReasonsList.length > 0 ? (
              suspiciousReasonsList.slice(0, 4).map((reason, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-destructive shadow-sm"
                  title={reason}
                >
                  <RiErrorWarningLine className="w-3.5 h-3.5" />
                </div>
              ))
            ) : (
              <span className="text-[11px] text-muted-foreground">&mdash;</span>
            )}
            {suspiciousReasonsList.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-accent border border-border flex items-center justify-center shadow-sm">
                <span className="text-[9px] font-bold text-muted-foreground">
                  +{suspiciousReasonsList.length - 4}
                </span>
              </div>
            )}
          </div>
          {/* Tiny Tags */}
          <div className="flex gap-1">
            {displayTags.slice(0, 1).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[9px] px-1.5 py-0 bg-accent text-muted-foreground border border-border rounded-sm shadow-none"
              >
                {tag.length > 12 ? `${tag.substring(0, 10)}...` : tag}
              </Badge>
            ))}
            {displayTags.length > 1 && (
              <Badge
                variant="outline"
                className="text-[9px] px-1 py-0 border-border text-muted-foreground rounded-sm shadow-none"
              >
                +{displayTags.length - 1}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
