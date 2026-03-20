"use client";

import {
  RiExternalLinkLine,
  RiFileTextLine,
  RiUserLine,
  RiGlobalLine,
} from "@remixicon/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { ExploreImage } from "@/lib/mock-data";
import type { ImageVisibleProperties } from "./images-view-options";

const LABEL_VARIANT: Record<string, "destructive" | "secondary" | "outline"> = {
  counterfeit: "destructive",
  suspicious: "secondary",
  legitimate: "outline",
  unlabeled: "outline",
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

  return (
    <div className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      {/* Checkbox */}
      <div
        className={`absolute left-2 top-2 z-10 transition-opacity ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div className="rounded-md bg-black/30 p-0.5">
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelect(checked === true)}
            className="border-white data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-neutral-900"
          />
        </div>
      </div>

      {/* Floating badge over image */}
      {visibleProperties.label && image.label !== "unlabeled" && (
        <div className="absolute bottom-[calc(50%+4px)] right-2 z-10">
          <Badge
            variant={LABEL_VARIANT[image.label]}
            className="text-[10px] font-semibold"
          >
            {image.labelText}
          </Badge>
        </div>
      )}

      {/* Image */}
      <div className="aspect-square overflow-hidden bg-neutral-100">
        <img
          src={image.thumbnailUrl}
          alt={image.imageId}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
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
