"use client";

import {
  RiExternalLinkLine,
  RiFileTextLine,
  RiUserLine,
  RiGlobalLine,
} from "@remixicon/react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExploreImage } from "@/lib/mock-data";
import { ImageWithFallback } from "./image-with-fallback";
import type { ImageVisibleProperties } from "./images-view-options";
import Link from "next/link";

const LABEL_DOT: Record<string, string> = {
  counterfeit: "bg-destructive/100",
  suspicious: "bg-amber-500",
  legitimate: "bg-emerald-500",
  trademark_infringement: "bg-orange-400",
  "trademark infringement": "bg-orange-400",
  copyright_violation: "bg-purple-500",
  unlabeled: "bg-muted-foreground/60",
};

interface ImageCardProps {
  image: ExploreImage;
  selected: boolean;
  visibleProperties: ImageVisibleProperties;
  onSelect: (checked: boolean) => void;
}

export function ImageCard({
  image,
  selected,
  visibleProperties,
  onSelect,
}: ImageCardProps) {
  const metrics = [
    visibleProperties.postsCount && {
      icon: RiFileTextLine,
      value: image.postsCount.toLocaleString("en-US"),
      label: "Posts",
    },
    visibleProperties.accountsCount && {
      icon: RiUserLine,
      value: image.accountsCount.toLocaleString("en-US"),
      label: "Accounts",
    },
    visibleProperties.websitesCount && {
      icon: RiGlobalLine,
      value: image.websitesCount.toLocaleString("en-US"),
      label: "Websites",
    },
  ].filter(Boolean) as { icon: typeof RiFileTextLine; value: string; label: string }[];

  const hasContent =
    visibleProperties.imageId || metrics.length > 0 || visibleProperties.label;

  const dotColor = LABEL_DOT[image.label] ?? "bg-muted-foreground/60";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        selected
          ? "border-foreground ring-1 ring-foreground"
          : "border-border"
      }`}
    >
      {/* Image area with overlays */}
      <div className="relative aspect-square overflow-hidden bg-muted border-b border-border">
        <ImageWithFallback
          src={image.thumbnailUrl}
          alt={image.imageId}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          fallbackClassName="h-full w-full"
        />

        {/* Checkbox Overlay (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(checked === true)}
            className="bg-background backdrop-blur-md border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
          />
        </div>

        {/* Label Badge Overlay (Top Right) */}
        {visibleProperties.label && image.label !== "unlabeled" && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-background backdrop-blur-md rounded-full shadow-sm border border-border">
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                {image.labelText}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {hasContent && (
        <div className="flex flex-col gap-2 p-3">
          {/* ID */}
          {visibleProperties.imageId && (
            <Link
              href={`/image/${image.id}`}
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {image.imageId}
              <RiExternalLinkLine size={14} />
            </Link>
          )}

          {/* Metrics */}
          {metrics.length > 0 && (
            <div
              className={`mt-1 grid gap-x-1 gap-y-2 ${
                metrics.length === 1
                  ? "grid-cols-1"
                  : metrics.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {metrics.map((m) => (
                <div key={m.label} className="flex flex-col">
                  <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                    <m.icon size={12} className="text-muted-foreground" />
                    {m.value}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
