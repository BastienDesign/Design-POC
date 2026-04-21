"use client";

import { useRef, useState } from "react";
import {
  RiLayoutColumnLine,
  RiDraggable,
  RiTableLine,
  RiLayoutGridLine,
  RiSearchLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ALL_COLUMNS } from "./explore-columns";

interface ExploreViewOptionsProps {
  layout: "table" | "grid";
  onLayoutChange: (layout: "table" | "grid") => void;
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
  gridColumns: number;
  onGridColumnsChange: (columns: number) => void;
}

export function ExploreViewOptions({
  layout,
  onLayoutChange,
  visibleColumns,
  onVisibleColumnsChange,
  columnOrder,
  onColumnOrderChange,
  gridColumns,
  onGridColumnsChange,
}: ExploreViewOptionsProps) {
  const [propertyFilter, setPropertyFilter] = useState("");
  const dragIdxRef = useRef<number | null>(null);
  const dragOverIdxRef = useRef<number | null>(null);

  const toggleableColumns = columnOrder
    .map((id) => ALL_COLUMNS.find((c) => c.id === id))
    .filter((c): c is (typeof ALL_COLUMNS)[number] => c !== undefined && !c.fixed);

  function handleToggle(colId: string, checked: boolean) {
    if (checked) {
      onVisibleColumnsChange([...visibleColumns, colId]);
    } else {
      onVisibleColumnsChange(visibleColumns.filter((id) => id !== colId));
    }
  }

  function handleDragStart(e: React.DragEvent, idx: number) {
    dragIdxRef.current = idx;
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4";
    }
  }

  function handleDragEnd(e: React.DragEvent) {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    dragIdxRef.current = null;
    dragOverIdxRef.current = null;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(_e: React.DragEvent, idx: number) {
    dragOverIdxRef.current = idx;
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const fromLocalIdx = dragIdxRef.current;
    const toLocalIdx = dragOverIdxRef.current;
    if (fromLocalIdx === null || toLocalIdx === null || fromLocalIdx === toLocalIdx) return;

    const fromColId = toggleableColumns[fromLocalIdx]?.id;
    const toColId = toggleableColumns[toLocalIdx]?.id;
    if (!fromColId || !toColId) return;

    const newOrder = [...columnOrder];
    const fromGlobalIdx = newOrder.indexOf(fromColId);
    const toGlobalIdx = newOrder.indexOf(toColId);
    if (fromGlobalIdx === -1 || toGlobalIdx === -1) return;

    newOrder.splice(fromGlobalIdx, 1);
    newOrder.splice(toGlobalIdx, 0, fromColId);
    onColumnOrderChange(newOrder);
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
      <PopoverContent
        align="end"
        className="w-[280px] rounded-xl border-border p-0 shadow-lg"
      >
        {/* Section 1: Layout */}
        <div className="border-b border-border p-3">
          <h4 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Layout
          </h4>
          <div className="flex items-center rounded-lg bg-muted p-1">
            <button
              onClick={() => onLayoutChange("table")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm transition-all duration-200 ${
                layout === "table"
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <RiTableLine className="h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => onLayoutChange("grid")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-sm transition-all duration-200 ${
                layout === "grid"
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <RiLayoutGridLine className="h-4 w-4" />
              Grid
            </button>
          </div>
        </div>

        {/* Section 2: Grid Density (visible only in grid mode) */}
        {layout === "grid" && (
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

        {/* Section 3: Properties */}
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
          <div className="flex max-h-[300px] flex-col gap-0.5 overflow-auto">
            {(() => {
              const filtered = toggleableColumns.filter((col) =>
                col.label.toLowerCase().includes(propertyFilter.toLowerCase())
              );
              if (filtered.length === 0) {
                return (
                  <div className="px-2 py-4 text-center text-[10px] text-muted-foreground">
                    No properties found
                  </div>
                );
              }
              return filtered.map((col) => {
                const globalIdx = toggleableColumns.indexOf(col);
                return (
                  <div
                    key={col.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, globalIdx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, globalIdx)}
                    onDrop={handleDrop}
                    className="flex items-center justify-between rounded-md px-1 py-1 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <RiDraggable className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing hover:text-foreground transition-colors shrink-0" />
                      <span className="text-sm text-foreground">{col.label}</span>
                    </div>
                    <Switch
                      checked={visibleColumns.includes(col.id)}
                      onCheckedChange={(checked) => handleToggle(col.id, checked)}
                      className="scale-75 origin-right"
                    />
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
