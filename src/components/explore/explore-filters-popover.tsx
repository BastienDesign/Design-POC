"use client";

import type { ComponentType } from "react";
import {
  RiSearchLine,
  RiCalendarLine,
  RiCalendarCheckLine,
  RiSettings4Line,
  RiPriceTag3Line,
  RiCheckDoubleLine,
  RiEyeOffLine,
  RiGlobalLine,
  RiMoneyDollarCircleLine,
  RiStackLine,
  RiMapPinLine,
  RiUserLine,
  RiHashtag,
  RiBarChartBoxLine,
  RiShieldCheckLine,
  RiMailLine,
  RiStore2Line,
  RiImageLine,
  RiBox3Line,
  RiEqualizer2Line,
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

interface FilterItem {
  id: string;
  label: string;
  icon: IconComponent;
  options: string[];
}

interface FilterCategory {
  category: string;
  items: FilterItem[];
}

const filterConfig: FilterCategory[] = [
  {
    category: "General",
    items: [
      { id: "date", label: "Date", icon: RiCalendarLine, options: ["Today", "Yesterday", "Last 7 days", "Last 30 days", "Custom Range"] },
      { id: "crawling_date", label: "Crawling date", icon: RiCalendarCheckLine, options: ["Any date", "Today", "Last 7 days", "Specific date"] },
      { id: "moderation_method", label: "Moderation Method", icon: RiSettings4Line, options: ["Manual", "Automated", "AI-Assisted"] },
    ],
  },
  {
    category: "Post",
    items: [
      { id: "label", label: "Label", icon: RiPriceTag3Line, options: ["Legitimate", "Suspicious", "Counterfeit", "Unlabeled"] },
      { id: "moderation_status", label: "Moderation status", icon: RiCheckDoubleLine, options: ["Un-moderated", "Moderated", "Checked", "Validated"] },
      { id: "takedown_status", label: "Takedown status", icon: RiEyeOffLine, options: ["Pending", "Success", "Failed", "Not Requested"] },
    ],
  },
  {
    category: "Commerce",
    items: [
      { id: "price", label: "Price", icon: RiMoneyDollarCircleLine, options: ["Under 50 €", "50–200 €", "200–500 €", "Over 500 €"] },
      { id: "stock", label: "Stock", icon: RiBox3Line, options: ["In Stock", "Low Stock", "Out of Stock"] },
      { id: "bundle", label: "Items in Bundle", icon: RiStackLine, options: ["Single", "2–5 items", "6–10 items", "10+ items"] },
      { id: "product_category", label: "Product Category", icon: RiStore2Line, options: ["Handbags", "Watches", "Electronics", "Footwear", "Fragrances", "Accessories", "Apparel"] },
    ],
  },
  {
    category: "Location & Account",
    items: [
      { id: "geo", label: "Estimated Geo", icon: RiMapPinLine, options: ["United States", "Germany", "France", "United Kingdom", "China", "Japan", "All Regions"] },
      { id: "channel", label: "Channel", icon: RiGlobalLine, options: ["Marketplace", "Social Commerce", "Independent Store", "Authorized Dealer"] },
      { id: "account", label: "Account", icon: RiUserLine, options: ["Known Offender", "New Seller", "Verified", "Unknown"] },
    ],
  },
  {
    category: "Analysis",
    items: [
      { id: "risk_score", label: "Risk Score", icon: RiBarChartBoxLine, options: ["Critical (90+)", "High (70–89)", "Medium (40–69)", "Low (0–39)"] },
      { id: "image_reasons", label: "Image Reasons", icon: RiImageLine, options: ["Watermark detected", "Stock photo match", "Rendered mockup", "Logo overlay", "None"] },
      { id: "enforcement", label: "Enforcement", icon: RiShieldCheckLine, options: ["DMCA Filed", "C&D Sent", "Platform Report", "No Action"] },
      { id: "tags", label: "Tags", icon: RiHashtag, options: ["Priority", "Repeat Offender", "Seasonal", "Review Needed"] },
      { id: "contact_info", label: "Contact Info", icon: RiMailLine, options: ["Available", "Missing", "Invalid"] },
    ],
  },
];

export type FilterMode = "basic" | "advanced";

interface ExploreFiltersMenuProps {
  onSelectFilter: (label: string, value: string, options: string[]) => void;
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

  // Advanced mode: Popover (stays open during interaction)
  if (filterMode === "advanced") {
    return (
      <Popover open={filterOpen} onOpenChange={onFilterOpenChange}>
        <PopoverTrigger asChild>
          <Button className="h-8 w-8 shrink-0 rounded-md bg-neutral-900 p-0 text-white shadow-sm hover:bg-black">
            <RiFilter3Line size={16} />
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
        <Button className="h-8 w-8 shrink-0 rounded-md bg-neutral-900 p-0 text-white shadow-sm hover:bg-black">
          <RiFilter3Line size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[260px] rounded-xl border-neutral-200 p-0 shadow-lg mt-1"
      >
        {/* Filter List with native hover sub-menus */}
        <div className="max-h-[350px] overflow-auto py-1">
          {filterConfig.map((cat) => (
            <DropdownMenuGroup key={cat.category}>
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {cat.category}
              </div>
              {cat.items.map((item) => (
                <DropdownMenuSub key={item.id}>
                  <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-700 cursor-pointer data-[state=open]:bg-neutral-50">
                    <item.icon size={15} className="text-neutral-400" />
                    {item.label}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-[180px] rounded-lg p-1 shadow-md">
                      {item.options.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          className="cursor-pointer text-[13px]"
                          onSelect={() => onSelectFilter(item.label, option, item.options)}
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ))}
            </DropdownMenuGroup>
          ))}
        </div>

        {/* Switch to Advanced */}
        <div className="border-t border-neutral-100 p-2">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onFilterOpenChange(false);
              // Small delay so the DropdownMenu can close before Popover mounts
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
