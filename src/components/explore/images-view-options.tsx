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
import { Slider } from "@/components/ui/slider";

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
  gridColumns: number;
  onGridColumnsChange: (columns: number) => void;
}

export function ImagesViewOptions({
  viewType,
  onViewTypeChange,
  visibleProperties,
  onVisiblePropertiesChange,
  gridColumns,
  onGridColumnsChange,
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
          className="h-8 gap-2 border-border px-3 text-[13px] font-medium text-foreground shadow-sm"
        >
          <RiLayoutColumnLine size={16} />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[280px] rounded-xl border-border p-0 shadow-lg">
        {/* Layout */}
        <div className="border-b border-border p-3">
          <h4 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Layout
          </h4>
          <div className="flex items-center rounded-lg bg-muted p-1">
            <button
              onClick={() => onViewTypeChange("list")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm transition-all duration-200 ${
                viewType === "list"
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <RiTableLine className="h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => onViewTypeChange("grid")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm transition-all duration-200 ${
                viewType === "grid"
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <RiLayoutGridLine className="h-4 w-4" />
              Grid
            </button>
          </div>
        </div>

        {/* Grid Density (visible only in grid mode) */}
        {viewType === "grid" && (
          <div className="border-b border-border p-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Grid Density
              </h4>
              <span className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-foreground">
                {gridColumns} Columns
              </span>
            </div>
            <div className="px-1">
              <Slider
                value={[gridColumns]}
                onValueChange={(val) => onGridColumnsChange(val[0])}
                min={2}
                max={6}
                step={1}
                className="py-2"
              />
            </div>
          </div>
        )}

        {/* Properties */}
        <div className="p-3">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Properties
          </div>
          <div className="relative mb-3 px-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search properties..."
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-accent border border-border rounded-md outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            {(() => {
              const filtered = PROPERTY_LABELS.filter((p) =>
                p.label.toLowerCase().includes(propertyFilter.toLowerCase())
              );
              if (filtered.length === 0) {
                return (
                  <div className="px-2 py-4 text-center text-[10px] text-muted-foreground">
                    No properties found
                  </div>
                );
              }
              return filtered.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md px-1 py-1 hover:bg-accent transition-colors"
                >
                  <span className="text-sm text-foreground">{label}</span>
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
