"use client";

import { useState, useEffect, useMemo } from "react";
import type { ComponentType } from "react";
import {
  RiPriceTag3Line,
  RiAlertLine,
  RiBarChartBoxLine,
  RiLightbulbLine,
  RiHashtag,
  RiStore2Line,
  RiArchiveLine,
  RiFileTextLine,
  RiSearchEyeLine,
  RiMoneyDollarCircleLine,
  RiBox3Line,
  RiStackLine,
  RiGlobalLine,
  RiMapPinLine,
  RiMailLine,
  RiUserLine,
  RiEyeOffLine,
  RiShieldCheckLine,
  RiCheckDoubleLine,
  RiSettings4Line,
  RiNumbersLine,
  RiGroupLine,
  RiEqualizer2Line,
  RiSearchLine,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RiFilter3Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { AdvancedFilterBuilder } from "./advanced-filter-builder";
import type { FilterQuery } from "./advanced-filter-builder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = ComponentType<any>;

type FilterItemType = "select" | "range" | "text" | "tree" | "nested";

interface FilterSubItem {
  id: string;
  shortLabel: string;
  fullLabel: string;
  inputType: Exclude<FilterItemType, "nested">;
  options: string[];
}

interface FilterItem {
  id: string;
  label: string;
  icon: IconComponent;
  inputType: FilterItemType;
  options: string[];
  subItems?: FilterSubItem[];
}

interface FilterCategory {
  category: string;
  items: FilterItem[];
}

const filterConfig: FilterCategory[] = [
  {
    category: "Classification & Risk",
    items: [
      { id: "label", label: "Label", icon: RiPriceTag3Line, inputType: "select", options: ["All Infringements", "Adult Content", "Branded Packaging", "Copyright Infringement", "Counterfeit", "Design Infringement", "Grey Market", "Infringement Non-Commercial"] },
      { id: "reasons", label: "Reasons", icon: RiAlertLine, inputType: "tree", options: ["Obvious counterfeit", "Highly suspicious", "Suspicious"] },
      { id: "risk_score", label: "Risk Score", icon: RiBarChartBoxLine, inputType: "range", options: [] },
      { id: "insight", label: "Insight", icon: RiLightbulbLine, inputType: "select", options: ["New Listing", "Price Drop", "Repeat Offender", "Trending"] },
      { id: "tags", label: "Tags", icon: RiHashtag, inputType: "text", options: [] },
    ],
  },
  {
    category: "Product & Commerce",
    items: [
      { id: "product_category", label: "Product Category", icon: RiStore2Line, inputType: "tree", options: ["Accessories", "Bag Wallet", "Clothing", "Cosmetics", "Entertainment", "Jewelry", "Luggage", "Shoe", "Others"] },
      { id: "product_line", label: "Product Line", icon: RiArchiveLine, inputType: "select", options: [] },
      { id: "product_name", label: "Product Name", icon: RiFileTextLine, inputType: "select", options: [] },
      { id: "product_identifier", label: "Product Identifier", icon: RiSearchEyeLine, inputType: "text", options: [] },
      { id: "price", label: "Price", icon: RiMoneyDollarCircleLine, inputType: "range", options: [] },
      { id: "stock", label: "Stock", icon: RiBox3Line, inputType: "range", options: [] },
      { id: "bundle", label: "Items in Bundle", icon: RiStackLine, inputType: "range", options: [] },
    ],
  },
  {
    category: "Source & Network",
    items: [
      { id: "channel", label: "Channel", icon: RiGlobalLine, inputType: "select", options: ["Social Media", "Marketplace", "Ecommerce", "Ads", "News & Blogs"] },
      { id: "website", label: "Website", icon: RiGlobalLine, inputType: "text", options: [] },
      { id: "contact_info", label: "Contact Info", icon: RiMailLine, inputType: "select", options: ["Phone Number", "Email Address", "WeChat", "WhatsApp", "Facebook", "Instagram", "Telegram", "Line", "Zalo"] },
      { id: "followers", label: "Followers", icon: RiUserLine, inputType: "range", options: [] },
      {
        id: "geo", label: "Estimated Geo", icon: RiMapPinLine, inputType: "nested", options: [],
        subItems: [
          { id: "geo_ships_to", shortLabel: "Ships To", fullLabel: "Estimated Geo (Ships To)", inputType: "select", options: ["United States", "United Kingdom", "Germany", "France", "China", "Japan", "South Korea", "Brazil", "Italy", "Spain"] },
          { id: "geo_ships_from", shortLabel: "Ships From", fullLabel: "Estimated Geo (Ships From)", inputType: "select", options: ["United States", "United Kingdom", "Germany", "France", "China", "Japan", "South Korea", "Brazil", "Italy", "Spain"] },
        ],
      },
    ],
  },
  {
    category: "Operations & Enforcement",
    items: [
      {
        id: "takedown", label: "Takedown Status", icon: RiEyeOffLine, inputType: "nested", options: [],
        subItems: [
          { id: "takedown_post", shortLabel: "Post", fullLabel: "Takedown Status (Post)", inputType: "select", options: ["Pending", "Removed", "Failed", "Ignored"] },
          { id: "takedown_account", shortLabel: "Account", fullLabel: "Takedown Status (Account)", inputType: "select", options: ["Pending", "Removed", "Failed", "Ignored"] },
          { id: "takedown_website", shortLabel: "Website", fullLabel: "Takedown Status (Website)", inputType: "select", options: ["Pending", "Removed", "Failed", "Ignored"] },
        ],
      },
      { id: "enforcement_ip", label: "Enforcement IP Asset", icon: RiShieldCheckLine, inputType: "select", options: [] },
      { id: "validation_errors", label: "Validation Errors", icon: RiCheckDoubleLine, inputType: "select", options: [] },
      { id: "enforcement_status", label: "Enforcement Status", icon: RiShieldCheckLine, inputType: "select", options: [] },
      { id: "moderation_method", label: "Moderation Method", icon: RiSettings4Line, inputType: "select", options: ["Automated", "Manual"] },
      { id: "search_rank", label: "Highest Rank in Search", icon: RiNumbersLine, inputType: "range", options: [] },
      { id: "users", label: "Users", icon: RiGroupLine, inputType: "select", options: [] },
    ],
  },
];

export type FilterMode = "basic" | "advanced";

// ── Sub-Menu with Split Hover Action (Include / Exclude) — for select/tree items ──

function FilterSubMenuSelect({
  item,
  onSelectFilter,
}: {
  item: FilterItem;
  onSelectFilter: (label: string, value: string, options: string[], operator: string) => void;
}) {
  return (
    <DropdownMenuSub key={item.id}>
      <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-700 cursor-pointer data-[state=open]:bg-neutral-50">
        <item.icon size={15} className="text-neutral-400" />
        {item.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-[200px] rounded-lg p-1 shadow-md">
          {item.options.map((option) => (
            <DropdownMenuItem
              key={option}
              className="group flex items-center justify-between cursor-pointer text-[13px]"
              onSelect={() => onSelectFilter(item.label, option, item.options, "is")}
            >
              <span className="truncate pr-2">{option}</span>
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectFilter(item.label, option, item.options, "is not");
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                className="hidden shrink-0 group-hover:flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-50 rounded transition-colors hover:bg-red-100 hover:text-red-700 cursor-pointer"
                title={`Exclude ${option}`}
              >
                Exclude
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

// ── Sub-Menu placeholder for range/text items (no options to list) ──

function FilterSubMenuInput({
  item,
  onSelectFilter,
}: {
  item: FilterItem;
  onSelectFilter: (label: string, value: string, options: string[], operator: string) => void;
}) {
  const placeholder = item.inputType === "range" ? "Enter a value…" : "Type to search…";

  return (
    <DropdownMenuSub key={item.id}>
      <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-700 cursor-pointer data-[state=open]:bg-neutral-50">
        <item.icon size={15} className="text-neutral-400" />
        {item.label}
        {item.inputType === "range" && (
          <span className="ml-auto text-[10px] font-medium text-neutral-400">#</span>
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-[200px] rounded-lg p-0 shadow-md">
          <div className="p-2">
            <input
              autoFocus
              placeholder={placeholder}
              className="h-7 w-full rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
              type={item.inputType === "range" ? "number" : "text"}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    onSelectFilter(item.label, val, [], "is");
                  }
                }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </div>
          <div className="border-t border-neutral-100 px-2 py-1.5">
            <p className="text-[10px] text-neutral-400">Press Enter to apply filter</p>
          </div>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

// ── Nested Sub-Menu for grouped fields (Geo, Takedown, etc.) ──

function FilterSubMenuNested({
  item,
  onSelectFilter,
}: {
  item: FilterItem;
  onSelectFilter: (label: string, value: string, options: string[], operator: string) => void;
}) {
  if (!item.subItems) return null;

  return (
    <DropdownMenuSub key={item.id}>
      <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-700 cursor-pointer data-[state=open]:bg-neutral-50">
        <item.icon size={15} className="text-neutral-400" />
        {item.label}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-[160px] rounded-lg p-1 shadow-md">
          {item.subItems.map((sub) => (
            <DropdownMenuSub key={sub.id}>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1.5 text-[13px] text-neutral-700 cursor-pointer data-[state=open]:bg-neutral-50">
                {sub.shortLabel}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-[200px] rounded-lg p-1 shadow-md">
                  {sub.options.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      className="group flex items-center justify-between cursor-pointer text-[13px]"
                      onSelect={() => onSelectFilter(sub.fullLabel, option, sub.options, "is")}
                    >
                      <span className="truncate pr-2">{option}</span>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onSelectFilter(sub.fullLabel, option, sub.options, "is not");
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onPointerUp={(e) => e.stopPropagation()}
                        className="hidden shrink-0 group-hover:flex items-center px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-50 rounded transition-colors hover:bg-red-100 hover:text-red-700 cursor-pointer"
                        title={`Exclude ${option}`}
                      >
                        Exclude
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

interface ExploreFiltersMenuProps {
  onSelectFilter: (label: string, value: string, options: string[], operator: string) => void;
  advancedQuery: FilterQuery;
  onAdvancedQueryChange: (query: FilterQuery) => void;
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
}

export function ExploreFiltersMenu({
  onSelectFilter,
  advancedQuery,
  onAdvancedQueryChange,
  filterMode,
  onFilterModeChange,
  filterOpen,
  onFilterOpenChange,
}: ExploreFiltersMenuProps) {
  const [menuSearch, setMenuSearch] = useState("");

  // Global "F" keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((document.activeElement?.tagName ?? ""))) return;
      if (e.key.toLowerCase() === "f" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onFilterOpenChange(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onFilterOpenChange]);

  // Filter schema by search query
  const filteredConfig = useMemo(() => {
    const q = menuSearch.trim().toLowerCase();
    if (!q) return filterConfig;

    return filterConfig
      .map((cat) => {
        const matchedItems = cat.items.filter((item) => {
          if (item.label.toLowerCase().includes(q)) return true;
          if (item.options.some((o) => o.toLowerCase().includes(q))) return true;
          if (item.subItems?.some(
            (sub) =>
              sub.shortLabel.toLowerCase().includes(q) ||
              sub.fullLabel.toLowerCase().includes(q) ||
              sub.options.some((o) => o.toLowerCase().includes(q))
          )) return true;
          return false;
        });
        if (matchedItems.length === 0) return null;
        return { ...cat, items: matchedItems };
      })
      .filter(Boolean) as FilterCategory[];
  }, [menuSearch]);

  // Advanced mode: Popover (stays open during interaction)
  if (filterMode === "advanced") {
    return (
      <Popover open={filterOpen} onOpenChange={onFilterOpenChange}>
        <PopoverTrigger asChild>
          <Button className="group relative h-8 w-8 shrink-0 rounded-md bg-neutral-900 p-0 text-white shadow-sm hover:bg-black">
            <RiFilter3Line size={16} />
            <span className="absolute -right-1.5 -top-1.5 rounded border border-neutral-200 bg-neutral-100 px-1 text-[8px] font-bold text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100">
              F
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[420px] rounded-xl border-neutral-200 p-0 shadow-lg mt-1"
        >
          <AdvancedFilterBuilder
            query={advancedQuery}
            onQueryChange={onAdvancedQueryChange}
            onSwitchToBasic={() => {
              onFilterOpenChange(false);
              requestAnimationFrame(() => {
                onFilterModeChange("basic");
                onFilterOpenChange(true);
              });
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Basic mode: DropdownMenu (native hover sub-menus)
  return (
    <DropdownMenu
      open={filterOpen}
      onOpenChange={onFilterOpenChange}
    >
      <DropdownMenuTrigger asChild>
        <Button className="group relative h-8 w-8 shrink-0 rounded-md bg-neutral-900 p-0 text-white shadow-sm hover:bg-black">
          <RiFilter3Line size={16} />
          <span className="absolute -right-1.5 -top-1.5 rounded border border-neutral-200 bg-neutral-100 px-1 text-[8px] font-bold text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100">
            F
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[280px] rounded-xl border-neutral-200 p-0 shadow-lg mt-1"
        onCloseAutoFocus={() => setMenuSearch("")}
      >
        {/* Sticky Search Bar */}
        <div className="sticky top-0 z-10 flex items-center border-b border-neutral-100 bg-neutral-50/80 px-2.5 py-1.5 backdrop-blur-sm">
          <RiSearchLine size={14} className="mr-2 shrink-0 text-neutral-400" />
          <input
            autoFocus
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Filter by name…"
            className="flex-1 bg-transparent text-xs text-neutral-700 outline-none placeholder:text-neutral-400"
          />
          {menuSearch && (
            <button
              onClick={() => setMenuSearch("")}
              onPointerDown={(e) => e.stopPropagation()}
              className="ml-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              <span className="text-xs">×</span>
            </button>
          )}
        </div>

        {/* Filter List with native hover sub-menus */}
        <div className="max-h-[350px] overflow-auto py-1">
          {filteredConfig.length === 0 ? (
            <p className="py-6 text-center text-xs text-neutral-400">No filters found.</p>
          ) : (
            filteredConfig.map((cat) => (
              <DropdownMenuGroup key={cat.category}>
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  {cat.category}
                </div>
                {cat.items.map((item) => {
                  // Nested groups (Geo, Takedown, etc.)
                  if (item.inputType === "nested") {
                    return (
                      <FilterSubMenuNested
                        key={item.id}
                        item={item}
                        onSelectFilter={onSelectFilter}
                      />
                    );
                  }
                  // Items with selectable options use the split-hover sub-menu
                  if ((item.inputType === "select" || item.inputType === "tree") && item.options.length > 0) {
                    return (
                      <FilterSubMenuSelect
                        key={item.id}
                        item={item}
                        onSelectFilter={onSelectFilter}
                      />
                    );
                  }
                  // Range / text / empty-options items get the input sub-menu
                  return (
                    <FilterSubMenuInput
                      key={item.id}
                      item={item}
                      onSelectFilter={onSelectFilter}
                    />
                  );
                })}
              </DropdownMenuGroup>
            ))
          )}
        </div>

        {/* Switch to Advanced */}
        <div className="border-t border-neutral-100 p-2">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onFilterOpenChange(false);
              requestAnimationFrame(() => {
                onFilterModeChange("advanced");
                onFilterOpenChange(true);
              });
            }}
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[12px] font-medium text-neutral-500 cursor-pointer"
          >
            <RiEqualizer2Line size={14} />
            Advanced Filter
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
