"use client";

import { useState } from "react";
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
  RiArrowRightSLine,
  RiEqualizer2Line,
} from "@remixicon/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RiFilter3Line } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { AdvancedFilterBuilder } from "./advanced-filter-builder";

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

interface ExploreFiltersMenuProps {
  onSelectFilter: (label: string, value: string, options: string[]) => void;
}

// ── Basic filter: sub-popover for a single filter item ──

function FilterItemPopover({
  item,
  onSelect,
}: {
  item: FilterItem;
  onSelect: (label: string, value: string, options: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-neutral-700 transition-colors hover:bg-neutral-50 cursor-pointer">
          <item.icon size={15} className="text-neutral-400 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <RiArrowRightSLine className="h-3.5 w-3.5 text-neutral-300" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-[180px] rounded-lg p-1 shadow-md">
        {item.options.map((option) => (
          <button
            key={option}
            onClick={() => {
              onSelect(item.label, option, item.options);
              setOpen(false);
            }}
            className="flex w-full items-center rounded-md px-3 py-1.5 text-[13px] text-neutral-700 transition-colors hover:bg-neutral-50 cursor-pointer"
          >
            {option}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ── Main component ──

export function ExploreFiltersMenu({ onSelectFilter }: ExploreFiltersMenuProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"basic" | "advanced">("basic");
  const [search, setSearch] = useState("");

  const filteredConfig = search
    ? filterConfig
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((cat) => cat.items.length > 0)
    : filterConfig;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="h-8 w-8 shrink-0 rounded-md bg-neutral-900 p-0 text-white shadow-sm hover:bg-black">
          <RiFilter3Line size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={`rounded-xl border-neutral-200 p-0 shadow-lg mt-1 ${
          mode === "advanced" ? "w-[420px]" : "w-[260px]"
        }`}
      >
        {mode === "advanced" ? (
          <AdvancedFilterBuilder
            onSwitchToBasic={() => setMode("basic")}
          />
        ) : (
          <>
            {/* Integrated Search */}
            <div className="border-b border-neutral-100 p-2">
              <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5">
                <RiSearchLine className="text-neutral-400" size={14} />
                <input
                  placeholder="Filter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-none bg-transparent text-[13px] placeholder:text-neutral-400 outline-none"
                />
                <span className="text-[10px] font-medium text-neutral-400">F</span>
              </div>
            </div>

            {/* Filter List */}
            <div className="max-h-[350px] overflow-auto py-1">
              {filteredConfig.map((cat) => (
                <div key={cat.category}>
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {cat.category}
                  </div>
                  {cat.items.map((item) => (
                    <FilterItemPopover
                      key={item.id}
                      item={item}
                      onSelect={onSelectFilter}
                    />
                  ))}
                </div>
              ))}
              {filteredConfig.length === 0 && (
                <div className="px-3 py-6 text-center text-[12px] text-neutral-400">
                  No filters match your search.
                </div>
              )}
            </div>

            {/* Switch to Advanced */}
            <div className="border-t border-neutral-100 p-2">
              <button
                onClick={() => setMode("advanced")}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12px] font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900 cursor-pointer"
              >
                <RiEqualizer2Line size={14} />
                Advanced Filter
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
