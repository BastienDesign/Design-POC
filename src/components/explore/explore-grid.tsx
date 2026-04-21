"use client";

import { RiSearchLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ExplorePost } from "@/lib/mock-data";
import type { PendingChanges } from "./bulk-action-pill";
import { PostGridCard } from "./post-grid-card";

interface ExploreGridProps {
  data: ExplorePost[];
  selectedRows: string[];
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onRowClick: (postId: string) => void;
  onResetFilters?: () => void;
  pendingChanges?: PendingChanges;
  columns?: number;
}

export function ExploreGrid({
  data,
  selectedRows,
  allSelected,
  someSelected,
  onSelectAll,
  onSelectRow,
  onRowClick,
  onResetFilters,
  pendingChanges,
  columns = 4,
}: ExploreGridProps) {
  if (data.length === 0) {
    return (
      <div className="flex-1 min-h-0 w-full">
        <div className="flex flex-col items-center justify-center w-full h-[450px] mx-auto">
          <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-4 ring-4 ring-muted/50">
            <RiSearchLine className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-[350px] text-center">
            We couldn&apos;t find any data matching your current search and
            filter combination. Try adjusting your parameters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="h-8 border-border text-foreground bg-card shadow-sm hover:bg-accent font-medium"
          >
            Clear all filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto w-full mb-4">
      {/* Select-all bar */}
      <div className="flex items-center gap-2 px-1 py-1.5">
        <Checkbox
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={(checked) => onSelectAll(checked === true)}
        />
        <span className="text-[11px] font-medium text-muted-foreground">
          {selectedRows.length > 0
            ? `${selectedRows.length} of ${data.length} selected`
            : `${data.length} items`}
        </span>
      </div>

      {/* Grid */}
      <div
        className="grid gap-4 pb-4 transition-all duration-200"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {data.map((post) => (
          <PostGridCard
            key={post.id}
            post={post}
            isSelected={selectedRows.includes(post.id)}
            onSelect={onSelectRow}
            onClick={onRowClick}
            pendingChanges={pendingChanges}
          />
        ))}
      </div>
    </div>
  );
}
