"use client";

import { useState } from "react";
import { RiLayoutColumnLine, RiTableLine, RiLayoutGridLine, RiSearchLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

export interface ImageVisibleProperties {
  imageId: boolean;
  postsCount: boolean;
  accountsCount: boolean;
  websitesCount: boolean;
  label: boolean;
  firstSeen: boolean;
}

const PROPERTY_LABELS: { key: keyof ImageVisibleProperties; label: string }[] = [
  { key: "imageId", label: "Image ID" },
  { key: "postsCount", label: "Posts" },
  { key: "accountsCount", label: "Accounts" },
  { key: "websitesCount", label: "Websites" },
  { key: "label", label: "Label" },
  { key: "firstSeen", label: "First Seen" },
];

interface ImagesViewOptionsProps {
  viewType: "grid" | "list";
  onViewTypeChange: (v: "grid" | "list") => void;
  visibleProperties: ImageVisibleProperties;
  onVisiblePropertiesChange: (p: ImageVisibleProperties) => void;
}

export function ImagesViewOptions({
  viewType,
  onViewTypeChange,
  visibleProperties,
  onVisiblePropertiesChange,
}: ImagesViewOptionsProps) {
  const [propertyFilter, setPropertyFilter] = useState("");

  function handleToggle(key: keyof ImageVisibleProperties, checked: boolean) {
    onVisiblePropertiesChange({ ...visibleProperties, [key]: checked });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 gap-2 border-neutral-200 px-3 text-[13px] font-medium text-neutral-700 shadow-sm"
        >
          <RiLayoutColumnLine size={16} />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] rounded-xl border-neutral-200 p-0 shadow-lg">
        {/* Layout */}
        <div className="border-b border-neutral-100 p-3">
          <h4 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Layout
          </h4>
          <div className="flex items-center rounded-lg bg-neutral-100 p-1">
            <button
              onClick={() => onViewTypeChange("list")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm transition-all duration-200 ${
                viewType === "list"
                  ? "bg-white font-medium text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <RiTableLine className="h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => onViewTypeChange("grid")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm transition-all duration-200 ${
                viewType === "grid"
                  ? "bg-white font-medium text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <RiLayoutGridLine className="h-4 w-4" />
              Grid
            </button>
          </div>
        </div>

        {/* Properties */}
        <div className="p-3">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Properties
          </div>
          <div className="relative mb-3 px-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-md outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all placeholder:text-neutral-400"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            {(() => {
              const filtered = PROPERTY_LABELS.filter((p) =>
                p.label.toLowerCase().includes(propertyFilter.toLowerCase())
              );
              if (filtered.length === 0) {
                return (
                  <div className="px-2 py-4 text-center text-[10px] text-neutral-400">
                    No properties found
                  </div>
                );
              }
              return filtered.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md px-1 py-1 hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-sm text-neutral-700">{label}</span>
                  <Switch
                    checked={visibleProperties[key]}
                    onCheckedChange={(checked) => handleToggle(key, checked)}
                    className="scale-75 origin-right"
                  />
                </div>
              ));
            })()}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
