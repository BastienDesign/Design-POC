"use client";

import { useState } from "react";
import {
  RiCloseLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiRefreshLine,
  RiUploadLine,
  RiDownloadLine,
  RiPlayFill,
  RiSearchLine,
  RiFilter3Line,
  RiEqualizer2Line,
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ExploreFiltersMenu } from "./explore-filters-popover";
import type { FilterMode } from "./explore-filters-popover";
import type { FilterQuery, FilterNode } from "./advanced-filter-builder";
import { DEFAULT_QUERY } from "./advanced-filter-builder";
import { ExploreViewOptions } from "./explore-view-options";
import { ImagesViewOptions } from "./images-view-options";
import type { ImageVisibleProperties } from "./images-view-options";

export interface ActiveFilter {
  id: string;
  type: "search" | "filter";
  label: string;
  operator: string;
  value: string | string[];
  options?: string[];
}

interface ExploreHeaderProps {
  filters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
  onFilterValueChange: (id: string, value: string | string[]) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onTokenizeSearch: () => void;
  onSelectFilter: (label: string, value: string, options: string[], operator: string) => void;
  onFilterOperatorChange: (id: string, operator: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabCounts: Record<string, number>;
  postsLayout: "table" | "grid";
  onPostsLayoutChange: (layout: "table" | "grid") => void;
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
  imagesViewType: "grid" | "list";
  onImagesViewTypeChange: (v: "grid" | "list") => void;
  imagesVisibleProperties: ImageVisibleProperties;
  onImagesVisiblePropertiesChange: (p: ImageVisibleProperties) => void;
  gridColumns: number;
  onGridColumnsChange: (columns: number) => void;
  filteredCount: number;
  onPlayModeration: () => void;
  advancedQuery: FilterQuery;
  onAdvancedQueryChange: (query: FilterQuery) => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  onResetAll: () => void;
}

// ── Rule Counter for Advanced Query Summary ──

function countRules(node: FilterNode): number {
  if (node.type === "rule") return 1;
  return node.children.reduce((acc, child) => acc + countRules(child), 0);
}

// ── Bulk Tag Editor for Search Token Chips ──

function InlineSearchTokenEditor({
  filterId,
  value,
  label,
  isExclusion,
  onValueChange,
  onRemove,
}: {
  filterId: string;
  value: string | string[];
  label: string;
  isExclusion: boolean;
  onValueChange: (id: string, value: string | string[]) => void;
  onRemove: (id: string) => void;
}) {
  const values = Array.isArray(value) ? value : [value];
  const displayValue = values[0];
  const extraCount = values.length - 1;

  const [open, setOpen] = useState(false);
  const [editValues, setEditValues] = useState<string[]>([]);
  const [newValueInput, setNewValueInput] = useState("");

  const handleOpen = () => {
    setEditValues([...values]);
    setNewValueInput("");
  };

  const handleRemoveTag = (idx: number) => {
    setEditValues((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAppend = () => {
    const terms = newValueInput.split(",").map((v) => v.trim()).filter(Boolean);
    if (terms.length === 0) return;
    setEditValues((prev) => {
      const next = [...prev];
      for (const t of terms) {
        if (!next.some((v) => v.toLowerCase() === t.toLowerCase())) {
          next.push(t);
        }
      }
      return next;
    });
    setNewValueInput("");
  };

  const handleSave = () => {
    if (editValues.length === 0) {
      onRemove(filterId);
    } else {
      onValueChange(filterId, editValues.length > 1 ? editValues : editValues[0]);
    }
    setOpen(false);
  };

  const triggerButton = (
    <button className={`flex items-center gap-0.5 rounded px-1 -mx-1 font-medium outline-none transition-colors hover:bg-muted cursor-pointer ${isExclusion ? "text-destructive" : "text-primary"}`}>
      {displayValue}
      {extraCount > 0 && (
        <span className={`ml-0.5 rounded-sm px-1 text-[10px] font-bold ${isExclusion ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"}`}>
          +{extraCount}
        </span>
      )}
    </button>
  );

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) handleOpen(); }}>
      {extraCount > 0 && !open ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                {triggerButton}
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="z-50 max-w-xs break-words text-xs">
              {values.join(", ")}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <PopoverTrigger asChild>
          {triggerButton}
        </PopoverTrigger>
      )}
      <PopoverContent className="w-72 p-0" align="start">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">
            {label}
            <span className="ml-1.5 rounded-sm bg-muted px-1 py-0.5 text-[10px] font-bold text-muted-foreground">
              {editValues.length}
            </span>
          </p>
          {editValues.length > 0 && (
            <button
              onClick={() => setEditValues([])}
              className="text-[11px] font-medium text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Tag list */}
        <div className="max-h-48 overflow-y-auto px-3 py-2">
          {editValues.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">No values — add below or save to remove chip.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {editValues.map((v, idx) => (
                <Badge
                  key={`${v}-${idx}`}
                  variant="secondary"
                  className="gap-1 pr-1 text-xs font-normal"
                >
                  {v}
                  <button
                    onClick={() => handleRemoveTag(idx)}
                    className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    <RiCloseLine size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Append input */}
        <div className="border-t border-border px-3 py-2">
          <div className="flex gap-1.5">
            <Input
              autoFocus
              value={newValueInput}
              onChange={(e) => setNewValueInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAppend();
                }
              }}
              className="h-7 flex-1 text-xs"
              placeholder="Add values (comma-separated)…"
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={handleAppend}
              disabled={!newValueInput.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Save */}
        <div className="border-t border-border px-3 py-2">
          <Button
            size="sm"
            className="h-7 w-full text-xs"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const TABS = ["Images", "Posts", "Websites", "Accounts"];

const EXPORT_LABELS: Record<string, string> = {
  Posts: "Export posts",
  Images: "Export images",
  Websites: "Export websites",
  Accounts: "Export accounts",
};

export function ExploreHeader({
  filters,
  onRemoveFilter,
  onFilterValueChange,
  searchValue,
  onSearchValueChange,
  onTokenizeSearch,
  onSelectFilter,
  onFilterOperatorChange,
  activeTab,
  onTabChange,
  tabCounts,
  postsLayout,
  onPostsLayoutChange,
  visibleColumns,
  onVisibleColumnsChange,
  columnOrder,
  onColumnOrderChange,
  imagesViewType,
  onImagesViewTypeChange,
  imagesVisibleProperties,
  onImagesVisiblePropertiesChange,
  gridColumns,
  onGridColumnsChange,
  filteredCount,
  onPlayModeration,
  advancedQuery,
  onAdvancedQueryChange,
  filterMode,
  onFilterModeChange,
  filterOpen,
  onFilterOpenChange,
  onResetAll,
}: ExploreHeaderProps) {
  const [isChipsExpanded, setIsChipsExpanded] = useState(false);

  return (
    <>
      {/* ── ROW 1: Filter Controls + Secondary Actions ── */}
      <div className="mb-3 flex items-center justify-between gap-4">
        {/* Left: Filter trigger + Search + Apply */}
        <div className="flex items-center gap-2">
          <ExploreFiltersMenu
            onSelectFilter={onSelectFilter}
            advancedQuery={advancedQuery}
            onAdvancedQueryChange={onAdvancedQueryChange}
            filterMode={filterMode}
            onFilterModeChange={onFilterModeChange}
            filterOpen={filterOpen}
            onFilterOpenChange={onFilterOpenChange}
          />
          <div className="relative flex h-9 w-[480px] items-center overflow-hidden rounded-md border bg-background shadow-sm transition-all focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
            <RiSearchLine size={15} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search or use '-' to exclude (e.g., -12345)..."
              value={searchValue}
              onChange={(e) => onSearchValueChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onTokenizeSearch();
                }
              }}
              className="h-full w-full rounded-none border-0 bg-transparent pl-8 pr-9 text-[13px] shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {searchValue && (
              <button
                onClick={() => onSearchValueChange("")}
                className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <RiCloseLine size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Saved Filters + Reset */}
        <div className="flex shrink-0 items-center gap-4 text-sm">
          <span className="flex cursor-pointer items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            Saved Filters
            <RiArrowDownSLine size={14} />
          </span>
          <span
            onClick={onResetAll}
            className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset
          </span>
        </div>
      </div>

      {/* ── ROW 2: Applied Filter Chips (Max 2 Rows) ── */}
      {filters.length > 0 && (
        <div className="mb-3 flex items-start justify-between gap-4">
          <div
            className={`flex flex-wrap items-center gap-2 overflow-hidden transition-all duration-200 ${
              isChipsExpanded ? "max-h-none" : "max-h-[68px]"
            }`}
          >
            {filters.map((filter) => {
              const Icon = filter.type === "search" ? RiSearchLine : RiFilter3Line;
              const isFreeText = filter.type === "search";
              const isExclusion = ["is not", "does not contain"].includes(filter.operator);
              const valueColor = isExclusion ? "text-destructive" : "text-primary";

              return (
                <div
                  key={filter.id}
                  className="flex items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-[13px] shadow-sm"
                >
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Icon size={14} />
                    {filter.label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterOperatorChange(filter.id, filter.operator);
                    }}
                    className={`rounded px-1 -mx-0.5 text-muted-foreground transition-colors font-medium cursor-pointer ${
                      isExclusion
                        ? "hover:bg-destructive/10 hover:text-destructive"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {filter.operator}
                  </button>
                  {isFreeText ? (
                    <InlineSearchTokenEditor
                      filterId={filter.id}
                      value={filter.value}
                      label={filter.label}
                      isExclusion={isExclusion}
                      onValueChange={onFilterValueChange}
                      onRemove={onRemoveFilter}
                    />
                  ) : filter.options && filter.options.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className={`font-medium hover:underline focus:outline-none ${valueColor}`}>
                        {Array.isArray(filter.value) ? filter.value[0] : filter.value}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {filter.options.map((opt) => (
                          <DropdownMenuItem
                            key={opt}
                            className="cursor-pointer text-[13px]"
                            onSelect={() => onFilterValueChange(filter.id, opt)}
                          >
                            {opt}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : Array.isArray(filter.value) && filter.value.length > 1 ? (
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center cursor-help">
                            <span className={`font-medium ${valueColor}`}>
                              {filter.value[0]}
                            </span>
                            <span className={`ml-1 rounded-sm px-1 text-[10px] font-bold ${
                              isExclusion ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                            }`}>
                              +{filter.value.length - 1}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="z-50 max-w-xs break-words text-xs">
                          {filter.value.join(", ")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className={`font-medium ${valueColor}`}>
                      {Array.isArray(filter.value) ? filter.value[0] : filter.value}
                    </span>
                  )}
                  <button
                    onClick={() => onRemoveFilter(filter.id)}
                    className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RiCloseLine size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right: Expand/Collapse */}
          {filters.length > 4 && (
            <Button
              variant="ghost"
              onClick={() => setIsChipsExpanded(!isChipsExpanded)}
              className="h-auto shrink-0 gap-1 px-1 pt-1 text-[13px]"
            >
              {isChipsExpanded ? (
                <>
                  Less <RiArrowUpSLine size={14} />
                </>
              ) : (
                <>
                  More <RiArrowDownSLine size={14} />
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* ── ROW 2b: Advanced Filter Summary Chip ── */}
      {advancedQuery.children.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <div
            onClick={() => {
              onFilterModeChange("advanced");
              onFilterOpenChange(true);
            }}
            className="flex items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-[13px] shadow-sm cursor-pointer transition-colors hover:bg-accent"
          >
            <span className="flex items-center gap-1 text-muted-foreground">
              <RiEqualizer2Line size={14} />
              Advanced Filter
            </span>
            <span className="font-medium text-primary">
              {countRules(advancedQuery)} {countRules(advancedQuery) === 1 ? "rule" : "rules"}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdvancedQueryChange(DEFAULT_QUERY);
              }}
              className="ml-1 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              <RiCloseLine size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── ROW 3: Tabs & Context-Aware Toolbar ── */}
      <div className="flex items-center justify-between">
        {/* Left: Tabs */}
        <div className="flex items-center gap-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-[14px] font-medium transition-colors ${
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {tab}
                {isActive && tabCounts[tab] !== undefined && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {tabCounts[tab].toLocaleString("en-US")}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Context-Aware Toolbar */}
        <div className="flex items-center gap-2 pb-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RiRefreshLine size={16} />
          </Button>

          {activeTab === "Posts" && (
            <ExploreViewOptions
              layout={postsLayout}
              onLayoutChange={onPostsLayoutChange}
              visibleColumns={visibleColumns}
              onVisibleColumnsChange={onVisibleColumnsChange}
              columnOrder={columnOrder}
              onColumnOrderChange={onColumnOrderChange}
              gridColumns={gridColumns}
              onGridColumnsChange={onGridColumnsChange}
            />
          )}
          {activeTab === "Images" && (
            <ImagesViewOptions
              viewType={imagesViewType}
              onViewTypeChange={onImagesViewTypeChange}
              visibleProperties={imagesVisibleProperties}
              onVisiblePropertiesChange={onImagesVisiblePropertiesChange}
              gridColumns={gridColumns}
              onGridColumnsChange={onGridColumnsChange}
            />
          )}

          <Separator orientation="vertical" className="h-4" />

          <Button variant="outline" className="h-8 text-[12px] font-medium shadow-sm">
            <RiUploadLine size={14} />
            Upload
          </Button>

          <Button variant="outline" className="h-8 text-[12px] font-medium shadow-sm">
            <RiDownloadLine size={14} />
            {EXPORT_LABELS[activeTab] ?? "Export"}
          </Button>

          <Button
            variant="default"
            className="h-9 px-4 gap-2 shadow-sm"
            onClick={onPlayModeration}
            disabled={filteredCount === 0}
          >
            <RiPlayFill className="w-4 h-4" />
            <span className="text-[12px] font-medium">Play Moderation on {filteredCount.toLocaleString("en-US")} Posts</span>
          </Button>
        </div>
      </div>
    </>
  );
}
