"use client";

import { useState, useMemo } from "react";
import {
  RiCloseLine,
  RiPriceTag3Line,
  RiArrowDownSLine,
  RiCheckLine,
  RiSearchLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
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
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import type { ExplorePost } from "@/lib/mock-data";

const TAG_OPTIONS = [
  "Priority",
  "Repeat Offender",
  "Seasonal",
  "Review Needed",
  "VIP Brand",
  "Escalated",
];

const VERDICT_OPTIONS = [
  { name: "Counterfeit", color: "bg-red-500" },
  { name: "Suspicious", color: "bg-amber-500" },
  { name: "Legitimate", color: "bg-emerald-500" },
  { name: "Trademark Infringement", color: "bg-orange-400" },
  { name: "Unlabeled", color: "bg-neutral-500" },
];

const CATEGORY_OPTIONS = [
  "Handbags",
  "Watches",
  "Electronics",
  "Footwear",
  "Fragrances",
  "Accessories",
  "Apparel",
];

const TAKEDOWN_OPTIONS = [
  "Send DMCA Notice",
  "Send C&D Letter",
  "Report to Platform",
  "Request Removal",
  "Escalate to Legal",
];

interface FieldDisplay {
  text: string;
  isMixed: boolean;
  hasValue: boolean;
}

function getFieldDisplay(
  rows: ExplorePost[],
  getter: (row: ExplorePost) => string | null | undefined,
  defaultText: string
): FieldDisplay {
  if (rows.length === 0) return { text: defaultText, isMixed: false, hasValue: false };

  const firstVal = getter(rows[0]);
  const isUniform = rows.every((row) => getter(row) === firstVal);

  if (!isUniform) return { text: "Mixed", isMixed: true, hasValue: true };
  if (firstVal) return { text: String(firstVal), isMixed: false, hasValue: true };

  return { text: defaultText, isMixed: false, hasValue: false };
}

export interface PendingChanges {
  label?: string;
  category?: string;
  takedown?: string;
  tags?: string[];
}

interface BulkActionPillProps {
  selectedCount: number;
  selectedRowsData: ExplorePost[];
  onClearSelection: () => void;
  pendingChanges: PendingChanges;
  onStageChange: (field: keyof PendingChanges, value: string | string[]) => void;
  onApplyAll: () => void;
}

export function BulkActionPill({
  selectedCount,
  selectedRowsData,
  onClearSelection,
  pendingChanges,
  onStageChange,
  onApplyAll,
}: BulkActionPillProps) {
  const [tagsOpen, setTagsOpen] = useState(false);

  const hasPending = Object.keys(pendingChanges).length > 0;

  const labelState = useMemo(
    () => getFieldDisplay(selectedRowsData, (r) => r.labelText, "Label"),
    [selectedRowsData]
  );
  const categoryState = useMemo(
    () => getFieldDisplay(selectedRowsData, (r) => r.productCategory, "Category"),
    [selectedRowsData]
  );
  const takedownState = useMemo(
    () =>
      getFieldDisplay(
        selectedRowsData,
        (r) => (r.takedownDate ? "Takedown Sent" : "Not Requested"),
        "Takedown"
      ),
    [selectedRowsData]
  );

  // Staged values override mixed/uniform display
  const isLabelStaged = !!pendingChanges.label;
  const displayLabel = pendingChanges.label ?? labelState.text;

  const isCategoryStaged = !!pendingChanges.category;
  const displayCategory = pendingChanges.category ?? categoryState.text;

  const isTakedownStaged = !!pendingChanges.takedown;
  const displayTakedown = pendingChanges.takedown ?? takedownState.text;

  const stagedTags = pendingChanges.tags ?? [];

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out flex items-center ${
        selectedCount > 0
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl">
        {/* Left: Count & Clear */}
        <div className="flex items-center gap-3 pl-3 pr-2 border-r border-neutral-700/50 h-8">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-white">{selectedCount}</span>
            <span className="text-neutral-400 font-medium">selected</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="h-6 w-6 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <RiCloseLine className="w-4 h-4" />
          </Button>
        </div>

        {/* 1. Add Tags (Searchable Popover) */}
        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-xs font-medium rounded-xl transition-colors ${
                stagedTags.length > 0
                  ? "text-blue-400 border border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20"
                  : "text-neutral-300 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <RiPriceTag3Line className="w-4 h-4 mr-1.5" />
              {stagedTags.length > 0 ? `${stagedTags.length} tag${stagedTags.length > 1 ? "s" : ""}` : "Add Tags"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="center"
            sideOffset={12}
            className="w-[200px] p-0 bg-neutral-900 border-neutral-800 shadow-2xl rounded-xl"
          >
            <Command className="bg-transparent">
              <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
                <RiSearchLine className="w-3.5 h-3.5 text-neutral-500" />
                <CommandInput
                  placeholder="Search tags..."
                  className="h-auto border-0 bg-transparent p-0 text-xs text-neutral-200 placeholder:text-neutral-500 focus:ring-0"
                />
              </div>
              <CommandList className="max-h-[180px] overflow-auto">
                <CommandEmpty className="py-4 text-center text-xs text-neutral-500">
                  No tags found.
                </CommandEmpty>
                <CommandGroup className="p-1">
                  {TAG_OPTIONS.map((tag) => {
                    const isActive = stagedTags.includes(tag);
                    return (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={() => {
                          const next = isActive
                            ? stagedTags.filter((t) => t !== tag)
                            : [...stagedTags, tag];
                          onStageChange("tags", next);
                        }}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 cursor-pointer data-[selected=true]:bg-neutral-800 data-[selected=true]:text-white"
                      >
                        {tag}
                        <RiCheckLine className={`h-3.5 w-3.5 ${isActive ? "opacity-100 text-blue-400" : "opacity-0"}`} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* 2. Middle: Category + Takedown */}
        <div className="flex items-center gap-1 px-1">
          {/* ── Category Dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-xs font-medium rounded-xl border border-transparent hover:bg-neutral-800 transition-colors ${
                  isCategoryStaged
                    ? "text-blue-400 border-blue-500/50 bg-blue-500/10"
                    : categoryState.isMixed && !isCategoryStaged
                      ? "text-neutral-500 italic"
                      : categoryState.hasValue
                        ? "text-white bg-neutral-800/50 border-neutral-700/50"
                        : "text-neutral-300"
                }`}
              >
                {displayCategory}
                <RiArrowDownSLine className="w-4 h-4 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="center"
              sideOffset={12}
              className="w-[180px] bg-neutral-900 border-neutral-800 shadow-2xl rounded-xl p-1"
            >
              {CATEGORY_OPTIONS.map((cat) => {
                const isActive = displayCategory === cat;
                return (
                  <DropdownMenuItem
                    key={cat}
                    onSelect={() => onStageChange("category", cat)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 cursor-pointer focus:bg-neutral-800 focus:text-white"
                  >
                    {cat}
                    {isActive && <RiCheckLine className="h-3.5 w-3.5 text-blue-400" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* ── Takedown Dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-xs font-medium rounded-xl border border-transparent hover:bg-neutral-800 transition-colors ${
                  isTakedownStaged
                    ? "text-blue-400 border-blue-500/50 bg-blue-500/10"
                    : takedownState.isMixed && !isTakedownStaged
                      ? "text-neutral-500 italic"
                      : takedownState.hasValue
                        ? "text-white bg-neutral-800/50 border-neutral-700/50"
                        : "text-neutral-300"
                }`}
              >
                {displayTakedown}
                <RiArrowDownSLine className="w-4 h-4 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="center"
              sideOffset={12}
              className="w-[200px] bg-neutral-900 border-neutral-800 shadow-2xl rounded-xl p-1"
            >
              {TAKEDOWN_OPTIONS.map((opt) => {
                const isActive = displayTakedown === opt;
                return (
                  <DropdownMenuItem
                    key={opt}
                    onSelect={() => onStageChange("takedown", opt)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 cursor-pointer focus:bg-neutral-800 focus:text-white"
                  >
                    {opt}
                    {isActive && <RiCheckLine className="h-3.5 w-3.5 text-blue-400" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 3. Right: Primary Label Action (The "Verdict") + Validate/Unvalidate */}
        <div className="flex items-center gap-1 pl-2 border-l border-neutral-700/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={`h-8 text-xs font-semibold px-4 rounded-xl shadow-sm flex items-center gap-2 transition-all ${
                  labelState.isMixed && !isLabelStaged
                    ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600 italic border border-neutral-600"
                    : isLabelStaged
                      ? "bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-neutral-900"
                      : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {displayLabel}
                <RiArrowDownSLine className="w-4 h-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              sideOffset={12}
              className="w-56 bg-neutral-900 border-neutral-800 text-neutral-200 shadow-2xl rounded-xl p-1"
            >
              {VERDICT_OPTIONS.map((l) => {
                const isActive = displayLabel === l.name;
                return (
                  <DropdownMenuItem
                    key={l.name}
                    onSelect={() => onStageChange("label", l.name)}
                    className="flex items-center gap-2 text-sm cursor-pointer rounded-lg px-3 py-2 focus:bg-neutral-800 focus:text-white"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${l.color}`} />
                    <span className="flex-1">{l.name}</span>
                    {isActive && <RiCheckLine className="h-3.5 w-3.5 text-blue-400" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasPending ? (
            <Button
              onClick={onApplyAll}
              className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-6 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <RiCheckLine className="w-4 h-4 mr-1.5" />
              Apply to {selectedCount} rows
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-8 border-neutral-700 bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white text-xs font-semibold px-4 rounded-xl"
            >
              Unvalidate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
