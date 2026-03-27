"use client";

import { useState } from "react";
import { RiArrowRightSLine } from "@remixicon/react";
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
  gridColumns?: number;
}

export function ImagesTab({ viewType, visibleProperties, gridColumns = 4 }: ImagesTabProps) {
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
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {viewType === "grid" ? (
          <GridView
            images={EXPLORE_IMAGES}
            selectedIds={selectedIds}
            allSelected={allSelected}
            someSelected={someSelected}
            visibleProperties={visibleProperties}
            onSelect={toggleSelect}
            onSelectAll={toggleAll}
            columns={gridColumns}
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
  allSelected,
  someSelected,
  visibleProperties,
  onSelect,
  onSelectAll,
  columns = 4,
}: {
  images: ExploreImage[];
  selectedIds: string[];
  allSelected: boolean;
  someSelected: boolean;
  visibleProperties: ImageVisibleProperties;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  columns?: number;
}) {
  return (
    <div>
      {/* Select-all bar */}
      <div className="flex items-center gap-2 px-1 py-1.5">
        <Checkbox
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={(checked) => onSelectAll(checked === true)}
        />
        <span className="text-[11px] font-medium text-neutral-400">
          {selectedIds.length > 0
            ? `${selectedIds.length} of ${images.length} selected`
            : `${images.length} items`}
        </span>
      </div>
      <div
        className="grid gap-4 pb-4 transition-all duration-200"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
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
    </div>
  );
}

const STICKY = "sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e5e5]";
const HEAD_TEXT = "text-[10px] uppercase font-bold text-neutral-700 tracking-wider";

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
    <div className="min-w-0 w-full relative">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${STICKY} w-[50px] pl-4`}>
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
              />
            </TableHead>
            <TableHead className={`${STICKY} w-[50px] px-2 text-center ${HEAD_TEXT}`}>Image</TableHead>
            {visibleProperties.imageId && (
              <TableHead className={`${STICKY} px-3 ${HEAD_TEXT}`}>Image ID</TableHead>
            )}
            {visibleProperties.postsCount && (
              <TableHead className={`${STICKY} px-3 ${HEAD_TEXT}`}>Posts</TableHead>
            )}
            {visibleProperties.accountsCount && (
              <TableHead className={`${STICKY} px-3 ${HEAD_TEXT}`}>Accounts</TableHead>
            )}
            {visibleProperties.websitesCount && (
              <TableHead className={`${STICKY} px-3 ${HEAD_TEXT}`}>Websites</TableHead>
            )}
            {visibleProperties.label && (
              <TableHead className={`${STICKY} px-3 ${HEAD_TEXT}`}>Label</TableHead>
            )}
            {visibleProperties.firstSeen && (
              <TableHead className={`${STICKY} px-3 ${HEAD_TEXT}`}>First Seen</TableHead>
            )}
            <TableHead className={`${STICKY} w-[50px]`} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((img, rowIdx) => {
            const isSelected = selectedIds.includes(img.id);
            return (
              <TableRow
                key={img.id}
                data-state={isSelected ? "selected" : undefined}
                className="group cursor-pointer"
              >
                <TableCell className="pl-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(img.id, checked === true)}
                  />
                </TableCell>
                <TableCell className="px-2">
                  <ImageThumbnail src={img.thumbnailUrl} alt={img.imageId} id={img.imageId} rowIndex={rowIdx} />
                </TableCell>
                {visibleProperties.imageId && (
                  <TableCell className="px-3">
                    <span className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer">
                      {img.imageId}
                    </span>
                  </TableCell>
                )}
                {visibleProperties.postsCount && (
                  <TableCell className="px-3 text-[13px] text-foreground tabular-nums">
                    {img.postsCount.toLocaleString()}
                  </TableCell>
                )}
                {visibleProperties.accountsCount && (
                  <TableCell className="px-3 text-[13px] text-foreground tabular-nums">
                    {img.accountsCount.toLocaleString()}
                  </TableCell>
                )}
                {visibleProperties.websitesCount && (
                  <TableCell className="px-3 text-[13px] text-foreground tabular-nums">
                    {img.websitesCount.toLocaleString()}
                  </TableCell>
                )}
                {visibleProperties.label && (
                  <TableCell className="px-3">
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
                  <TableCell className="px-3 text-[13px] text-foreground">
                    {img.firstSeen}
                  </TableCell>
                )}
                <TableCell className="pr-3">
                  <div className="flex items-center justify-center text-neutral-400 group-hover:text-neutral-900">
                    <RiArrowRightSLine className="h-5 w-5" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
