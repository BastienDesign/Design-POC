"use client";

import {
  RiExternalLinkLine,
  RiFileTextLine,
  RiUserLine,
  RiGlobalLine,
} from "@remixicon/react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExploreImage } from "@/lib/mock-data";
import type { ImageVisibleProperties } from "./images-view-options";

const LABEL_DOT: Record<string, string> = {
  counterfeit: "bg-red-500",
  suspicious: "bg-amber-500",
  legitimate: "bg-emerald-500",
  "trademark infringement": "bg-orange-400",
  unlabeled: "bg-neutral-300",
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
      value: image.postsCount.toLocaleString(),
      label: "Posts",
    },
    visibleProperties.accountsCount && {
      icon: RiUserLine,
      value: image.accountsCount.toLocaleString(),
      label: "Accounts",
    },
    visibleProperties.websitesCount && {
      icon: RiGlobalLine,
      value: image.websitesCount.toLocaleString(),
      label: "Websites",
    },
  ].filter(Boolean) as { icon: typeof RiFileTextLine; value: string; label: string }[];

  const hasContent =
    visibleProperties.imageId || metrics.length > 0 || visibleProperties.label;

  const dotColor = LABEL_DOT[image.label] ?? "bg-neutral-300";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        selected
          ? "border-neutral-900 ring-1 ring-neutral-900"
          : "border-neutral-200"
      }`}
    >
      {/* Image area with overlays */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100 border-b border-neutral-100">
        <img
          src={image.thumbnailUrl}
          alt={image.imageId}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* Checkbox Overlay (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(checked === true)}
            className="bg-white/80 backdrop-blur-md border-neutral-300 data-[state=checked]:bg-neutral-900 data-[state=checked]:border-neutral-900"
          />
        </div>

        {/* Label Badge Overlay (Top Right) */}
        {visibleProperties.label && image.label !== "unlabeled" && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-neutral-100">
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">
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
            <a
              href="#"
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
            >
              {image.imageId}
              <RiExternalLinkLine size={14} />
            </a>
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
                  <span className="flex items-center gap-1 text-xs font-semibold text-neutral-900">
                    <m.icon size={12} className="text-neutral-400" />
                    {m.value}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
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
