"use client";

import { useState } from "react";
import {
  RiMoreFill,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImageCard } from "./image-card";
import { ImageThumbnail } from "./image-thumbnail";
import type { ImageVisibleProperties } from "./images-view-options";
import { EXPLORE_IMAGES } from "@/lib/mock-data";
import type { ExploreImage } from "@/lib/mock-data";

interface ImagesTabProps {
  viewType: "grid" | "list";
  visibleProperties: ImageVisibleProperties;
}

export function ImagesTab({ viewType, visibleProperties }: ImagesTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allIds = EXPLORE_IMAGES.map((img) => img.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((r) => r !== id)
    );
  }

  function toggleAll(checked: boolean) {
    setSelectedIds(checked ? [...allIds] : []);
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      {/* Selection indicator */}
      {selectedIds.length > 0 && (
        <div className="shrink-0 pb-3 text-[13px] font-medium text-neutral-900">
          {selectedIds.length} selected
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {viewType === "grid" ? (
          <GridView
            images={EXPLORE_IMAGES}
            selectedIds={selectedIds}
            visibleProperties={visibleProperties}
            onSelect={toggleSelect}
          />
        ) : (
          <ListView
            images={EXPLORE_IMAGES}
            selectedIds={selectedIds}
            allSelected={allSelected}
            someSelected={someSelected}
            visibleProperties={visibleProperties}
            onSelect={toggleSelect}
            onSelectAll={toggleAll}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Grid View ──────────────────────────────────────────── */
function GridView({
  images,
  selectedIds,
  visibleProperties,
  onSelect,
}: {
  images: ExploreImage[];
  selectedIds: string[];
  visibleProperties: ImageVisibleProperties;
  onSelect: (id: string, checked: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 pb-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {images.map((img) => (
        <ImageCard
          key={img.id}
          image={img}
          selected={selectedIds.includes(img.id)}
          visibleProperties={visibleProperties}
          onSelect={(checked) => onSelect(img.id, checked)}
        />
      ))}
    </div>
  );
}

const STICKY_HEAD = "sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e5e5]";
const HEAD_TEXT = "text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap";

/* ─── List View ──────────────────────────────────────────── */
function ListView({
  images,
  selectedIds,
  allSelected,
  someSelected,
  visibleProperties,
  onSelect,
  onSelectAll,
}: {
  images: ExploreImage[];
  selectedIds: string[];
  allSelected: boolean;
  someSelected: boolean;
  visibleProperties: ImageVisibleProperties;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}) {
  return (
    <div className="flex-1 min-h-0 overflow-auto w-full border border-neutral-200 rounded-md bg-white shadow-sm relative">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${STICKY_HEAD} w-12 pl-4`}>
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
              />
            </TableHead>
            <TableHead className={`${STICKY_HEAD} w-16 px-3 ${HEAD_TEXT}`}>Image</TableHead>
            {visibleProperties.imageId && (
              <TableHead className={`${STICKY_HEAD} px-3 ${HEAD_TEXT}`}>Image ID</TableHead>
            )}
            {visibleProperties.postsCount && (
              <TableHead className={`${STICKY_HEAD} px-3 ${HEAD_TEXT}`}>Posts</TableHead>
            )}
            {visibleProperties.accountsCount && (
              <TableHead className={`${STICKY_HEAD} px-3 ${HEAD_TEXT}`}>Accounts</TableHead>
            )}
            {visibleProperties.websitesCount && (
              <TableHead className={`${STICKY_HEAD} px-3 ${HEAD_TEXT}`}>Websites</TableHead>
            )}
            {visibleProperties.label && (
              <TableHead className={`${STICKY_HEAD} px-3 ${HEAD_TEXT}`}>Label</TableHead>
            )}
            {visibleProperties.firstSeen && (
              <TableHead className={`${STICKY_HEAD} px-3 ${HEAD_TEXT}`}>First Seen</TableHead>
            )}
            <TableHead className={`${STICKY_HEAD} w-10 px-3`} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((img, rowIdx) => {
            const isSelected = selectedIds.includes(img.id);
            return (
              <TableRow
                key={img.id}
                data-state={isSelected ? "selected" : undefined}
                className="h-14 border-b border-neutral-100 hover:bg-neutral-50 transition-colors group"
              >
                <TableCell className="py-3 pl-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(img.id, checked === true)}
                  />
                </TableCell>
                <TableCell className="py-3 px-3">
                  <ImageThumbnail src={img.thumbnailUrl} alt={img.imageId} id={img.imageId} rowIndex={rowIdx} />
                </TableCell>
                {visibleProperties.imageId && (
                  <TableCell className="py-3 px-3">
                    <span className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">
                      {img.imageId}
                    </span>
                  </TableCell>
                )}
                {visibleProperties.postsCount && (
                  <TableCell className="py-3 px-3 text-[13px] text-foreground tabular-nums">
                    {img.postsCount.toLocaleString()}
                  </TableCell>
                )}
                {visibleProperties.accountsCount && (
                  <TableCell className="py-3 px-3 text-[13px] text-foreground tabular-nums">
                    {img.accountsCount.toLocaleString()}
                  </TableCell>
                )}
                {visibleProperties.websitesCount && (
                  <TableCell className="py-3 px-3 text-[13px] text-foreground tabular-nums">
                    {img.websitesCount.toLocaleString()}
                  </TableCell>
                )}
                {visibleProperties.label && (
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${
                        img.label === "counterfeit" ? "bg-red-500" :
                        img.label === "suspicious" ? "bg-amber-500" :
                        img.label === "legitimate" ? "bg-emerald-500" :
                        "bg-neutral-300"
                      }`} />
                      <span className="text-[13px] text-foreground capitalize">
                        {img.label}
                      </span>
                    </div>
                  </TableCell>
                )}
                {visibleProperties.firstSeen && (
                  <TableCell className="py-3 px-3 text-[13px] text-foreground">
                    {img.firstSeen}
                  </TableCell>
                )}
                <TableCell className="py-3 pr-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <RiMoreFill className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
