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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import type { FilterQuery, FilterRule, FieldDef } from "./advanced-filter-builder";
import { getFieldDef } from "./advanced-filter-builder";
import { ExploreViewOptions } from "./explore-view-options";
import { ImagesViewOptions } from "./images-view-options";
import type { ImageVisibleProperties } from "./images-view-options";

export interface ActiveFilter {
  id: string;
  type: "search" | "filter";
  label: string;
  operator: string;
  value: string;
  options?: string[];
}

interface ExploreHeaderProps {
  filters: ActiveFilter[];
  onRemoveFilter: (id: string) => void;
  onFilterValueChange: (id: string, value: string) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onTokenizeSearch: () => void;
  onSelectFilter: (label: string, value: string, options: string[]) => void;
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

// ── Inline Chip Value Editor ──

function InlineChipValue({
  rule,
  fieldDef,
  onValueChange,
}: {
  rule: FilterRule;
  fieldDef: FieldDef | undefined;
  onValueChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(rule.value);

  const displayValue = rule.value || "Select…";
  const isEnum = fieldDef?.type === "enum" && fieldDef.options;

  if (isEnum) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-0.5 font-semibold text-neutral-900 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap">
            {displayValue}
            <RiArrowDownSLine size={12} className="text-neutral-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px] rounded-lg p-1 shadow-md">
          {fieldDef.options!.map((opt) => (
            <DropdownMenuItem
              key={opt}
              className="cursor-pointer text-[12px]"
              onSelect={() => {
                onValueChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Text / Number: Popover with Input
  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && draft !== rule.value) onValueChange(draft);
      }}
    >
      <PopoverTrigger asChild>
        <button
          onClick={() => setDraft(rule.value)}
          className="flex items-center gap-0.5 font-semibold text-neutral-900 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap"
        >
          {displayValue}
          <RiArrowDownSLine size={12} className="text-neutral-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[200px] p-2">
        <Input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onValueChange(draft);
              setOpen(false);
            }
          }}
          placeholder={fieldDef?.type === "number" ? "0" : "Value…"}
          type={fieldDef?.type === "number" ? "number" : "text"}
          className="h-8 text-[12px] border-neutral-200 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-300"
        />
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
          <div className="relative flex h-9 w-[480px] items-center overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm transition-all focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900">
            <RiSearchLine size={15} className="absolute left-2.5 text-neutral-400 pointer-events-none" />
            <Input
              placeholder="Search IDs, accounts, websites, or brands..."
              value={searchValue}
              onChange={(e) => onSearchValueChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onTokenizeSearch();
                }
              }}
              className="h-full w-full rounded-none border-0 bg-transparent pl-8 pr-9 text-[13px] shadow-none placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {searchValue && (
              <button
                onClick={() => onSearchValueChange("")}
                className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
              >
                <RiCloseLine size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Saved Filters + Reset */}
        <div className="flex shrink-0 items-center gap-4 text-sm">
          <span className="flex cursor-pointer items-center gap-1 text-neutral-500 transition-colors hover:text-neutral-900">
            Saved Filters
            <RiArrowDownSLine size={14} />
          </span>
          <span
            onClick={onResetAll}
            className="cursor-pointer text-neutral-400 transition-colors hover:text-neutral-900"
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
              return (
                <div
                  key={filter.id}
                  className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[13px] shadow-sm"
                >
                  <span className="flex items-center gap-1 text-neutral-500">
                    <Icon size={14} />
                    {filter.label} {filter.operator}
                  </span>
                  {filter.options && filter.options.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger className="font-medium text-blue-600 hover:underline focus:outline-none">
                        {filter.value}
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
                  ) : (
                    <span className="font-medium text-blue-600">{filter.value}</span>
                  )}
                  <button
                    onClick={() => onRemoveFilter(filter.id)}
                    className="ml-1 text-neutral-400 transition-colors hover:text-neutral-900"
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
              className="h-auto shrink-0 gap-1 px-1 pt-1 text-[13px] text-neutral-500 hover:text-neutral-900"
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

      {/* ── ROW 2b: Advanced Filter Chips (inline-editable) ── */}
      {advancedQuery.rules.length > 0 && (
        <div className="mb-3 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => { onFilterModeChange("advanced"); onFilterOpenChange(true); }}
            className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
          >
            <RiEqualizer2Line size={13} />
            Advanced
          </button>
          {advancedQuery.rules.map((rule, index) => {
            const fieldDef = getFieldDef(rule.field);
            const fieldLabel = fieldDef?.label ?? rule.field;
            const isUnary = rule.operator === "is empty" || rule.operator === "is not empty";

            const updateRuleValue = (newValue: string) => {
              onAdvancedQueryChange({
                ...advancedQuery,
                rules: advancedQuery.rules.map((r) =>
                  r.id === rule.id ? { ...r, value: newValue } : r
                ),
              });
            };

            return (
              <div key={rule.id} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 select-none">
                    {advancedQuery.logicalOperator}
                  </span>
                )}
                <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[12px] shadow-sm">
                  <span className="font-medium text-neutral-700">{fieldLabel}</span>
                  <span className="text-neutral-400">{rule.operator}</span>
                  {!isUnary && (
                    <InlineChipValue
                      rule={rule}
                      fieldDef={fieldDef}
                      onValueChange={updateRuleValue}
                    />
                  )}
                  <button
                    onClick={() =>
                      onAdvancedQueryChange({
                        ...advancedQuery,
                        rules: advancedQuery.rules.filter((r) => r.id !== rule.id),
                      })
                    }
                    className="ml-0.5 rounded-full p-0.5 text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-neutral-600 cursor-pointer"
                  >
                    <RiCloseLine size={12} />
                  </button>
                </div>
              </div>
            );
          })}
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
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-900"
                }`}
              >
                {tab}
                {isActive && tabCounts[tab] !== undefined && (
                  <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-neutral-500">
                    {tabCounts[tab].toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Context-Aware Toolbar */}
        <div className="flex items-center gap-2 pb-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-900">
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

          <Separator orientation="vertical" className="h-4 bg-neutral-200" />

          <Button variant="outline" className="h-8 border-neutral-200 text-[12px] font-medium shadow-sm">
            <RiUploadLine size={14} />
            Upload
          </Button>

          <Button variant="outline" className="h-8 border-neutral-200 text-[12px] font-medium shadow-sm">
            <RiDownloadLine size={14} />
            {EXPORT_LABELS[activeTab] ?? "Export"}
          </Button>

          <Button
            variant="default"
            className="h-9 px-4 gap-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md shadow-sm transition-all"
            onClick={onPlayModeration}
            disabled={filteredCount === 0}
          >
            <RiPlayFill className="w-4 h-4" />
            <span className="text-[12px] font-medium">Play Moderation on {filteredCount.toLocaleString()} Posts</span>
          </Button>
        </div>
      </div>
    </>
  );
}
