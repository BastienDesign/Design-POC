"use client";

import { useState, useMemo, forwardRef } from "react";
import {
  RiCloseLine,
  RiPriceTag3Line,
  RiArrowDownSLine,
  RiCheckLine,
  RiSearchLine,
  RiSettings4Line,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { ExplorePost } from "@/lib/mock-data";

const TAG_OPTIONS = [
  "Priority",
  "Repeat Offender",
  "Seasonal",
  "Review Needed",
  "VIP Brand",
  "Escalated",
];

import { VERDICT_OPTIONS } from "./verdict-options";

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

const ACTION_OPTIONS = [
  "Mark as Counterfeit",
  "Mark as Legitimate",
  "Escalate to Legal",
  "Send Takedown",
  "Archive",
];

const GEO_OPTIONS = [
  "United States",
  "China",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "India",
  "Brazil",
  "Turkey",
  "South Korea",
];

const PRODUCT_OPTIONS = [
  "Handbags",
  "Watches",
  "Electronics",
  "Footwear",
  "Fragrances",
  "Accessories",
  "Apparel",
];

const IP_ASSET_OPTIONS = [
  "Trademark — Word Mark",
  "Trademark — Logo Mark",
  "Copyright — Product Image",
  "Design Patent",
  "Trade Dress",
];

const IP_CERTIFICATE_OPTIONS = [
  "US-TM-2024-0891",
  "EU-TM-2023-4412",
  "CN-TM-2024-1107",
  "WIPO-PCT-2023-8834",
  "UK-DES-2024-0223",
];

const SITE_CODE_OPTIONS = [
  "SITE-AMZ-US",
  "SITE-ALI-CN",
  "SITE-EBAY-UK",
  "SITE-WISH-GL",
  "SITE-TEMU-US",
  "SITE-SHEIN-GL",
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

/* ── Inline Ghost Label Trigger ── */
interface BarDropdownTriggerProps {
  fieldTitle: string;
  displayValue: string;
  isMixed: boolean;
  isStaged: boolean;
  isPrimary?: boolean;
}

const BarDropdownTrigger = forwardRef<HTMLButtonElement, BarDropdownTriggerProps & React.ComponentPropsWithoutRef<"button">>(
  ({ fieldTitle, displayValue, isMixed, isStaged, isPrimary, ...props }, ref) => {
    // Primary (Label/Verdict) button: special background treatments
    if (isPrimary) {
      return (
        <Button
          ref={ref}
          className={`h-8 text-xs font-semibold px-4 rounded-xl shadow-sm flex items-center gap-2 transition-all ${
            isMixed && !isStaged
              ? "bg-background/15 hover:bg-background/20 border border-background/20"
              : isStaged
                ? "bg-chart-3 hover:bg-chart-3/90 text-background ring-2 ring-chart-3 ring-offset-2 ring-offset-foreground"
                : "bg-destructive hover:bg-destructive/90 text-background"
          }`}
          {...props}
        >
          <div className="flex items-center gap-1.5">
            {isMixed && !isStaged ? (
              <>
                <span className="text-[10px] uppercase font-bold tracking-wider text-background/40">
                  {fieldTitle}
                </span>
                <span className="italic text-background/80 text-xs">Mixed</span>
              </>
            ) : (
              <span className="text-xs font-semibold">{displayValue}</span>
            )}
          </div>
          <RiArrowDownSLine className="w-4 h-4 opacity-70" />
        </Button>
      );
    }

    // Standard bar dropdown trigger
    const showGhost = isMixed && !isStaged;
    const hasKnownValue = !isMixed && displayValue !== fieldTitle;

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={`h-8 px-3 rounded-xl border border-transparent hover:bg-background/10 transition-colors ${
          isStaged
            ? "text-chart-3 border-chart-3/50 bg-chart-3/15"
            : hasKnownValue
              ? "text-background bg-background/5 border-background/10"
              : "text-background/80"
        }`}
        {...props}
      >
        <div className="flex items-center gap-1.5">
          {showGhost ? (
            <>
              <span className="text-[10px] uppercase font-bold tracking-wider text-background/40">
                {fieldTitle}
              </span>
              <span className="italic text-background/60 text-xs">Mixed</span>
            </>
          ) : (
            <span className="text-xs font-medium">{displayValue}</span>
          )}
        </div>
        <RiArrowDownSLine className="w-4 h-4 ml-1 opacity-50" />
      </Button>
    );
  }
);
BarDropdownTrigger.displayName = "BarDropdownTrigger";

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
  const [isBatchSheetOpen, setIsBatchSheetOpen] = useState(false);
  const [actionBarMode, setActionBarMode] = useState<"triage" | "enforce">("triage");

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
      <div className="flex items-center gap-2 p-1.5 bg-foreground border border-background/10 shadow-2xl rounded-2xl">
        {/* Left: Count & Clear */}
        <div className="flex items-center gap-3 pl-3 pr-2 border-r border-background/10 h-8">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-background">{selectedCount}</span>
            <span className="text-background/60 font-medium">selected</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="h-6 w-6 rounded-full text-background/60 hover:text-background hover:bg-background/10"
          >
            <RiCloseLine className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-medium text-background/60 hover:text-background hover:bg-background/10 transition-colors outline-none cursor-pointer">
              {actionBarMode === "triage" ? "Triage" : "Enforce"}
              <RiArrowDownSLine className="w-3.5 h-3.5 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={12}
            className="w-[160px] bg-foreground border-background/10 shadow-2xl rounded-xl p-1"
          >
            <DropdownMenuItem
              onSelect={() => setActionBarMode("triage")}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-background/80 cursor-pointer focus:bg-background/10 focus:text-background"
            >
              Triage Mode
              {actionBarMode === "triage" && (
                <RiCheckLine className="h-3.5 w-3.5 text-chart-3" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => setActionBarMode("enforce")}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-background/80 cursor-pointer focus:bg-background/10 focus:text-background"
            >
              Enforce Mode
              {actionBarMode === "enforce" && (
                <RiCheckLine className="h-3.5 w-3.5 text-chart-3" />
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-4 bg-background/15/50" />

        {/* Always visible: Add Tags */}
        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-xs font-medium rounded-xl transition-colors ${
                stagedTags.length > 0
                  ? "text-chart-3 border border-chart-3/50 bg-chart-3/15 hover:bg-chart-3/20"
                  : "text-background/80 hover:text-background hover:bg-background/10"
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
            className="w-[200px] p-0 bg-foreground border-background/10 shadow-2xl rounded-xl"
          >
            <Command className="bg-transparent">
              <div className="flex items-center gap-2 border-b border-background/10 px-3 py-2">
                <RiSearchLine className="w-3.5 h-3.5 text-background/50" />
                <CommandInput
                  placeholder="Search tags..."
                  className="h-auto border-0 bg-transparent p-0 text-xs text-background/90 placeholder:text-background/50 focus:ring-0"
                />
              </div>
              <CommandList className="max-h-[180px] overflow-auto">
                <CommandEmpty className="py-4 text-center text-xs text-background/50">
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
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-background/80 cursor-pointer data-[selected=true]:bg-background/10 data-[selected=true]:text-background"
                      >
                        {tag}
                        <RiCheckLine className={`h-3.5 w-3.5 ${isActive ? "opacity-100 text-chart-3" : "opacity-0"}`} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* ── Dynamic Middle Section (mode-dependent) ── */}
        <div className="flex items-center gap-1 px-1">
          {actionBarMode === "triage" ? (
            <>
              {/* ── Category Dropdown ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BarDropdownTrigger
                    fieldTitle="Category"
                    displayValue={displayCategory}
                    isMixed={categoryState.isMixed}
                    isStaged={isCategoryStaged}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  sideOffset={12}
                  className="w-[180px] bg-foreground border-background/10 shadow-2xl rounded-xl p-1"
                >
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isActive = displayCategory === cat;
                    return (
                      <DropdownMenuItem
                        key={cat}
                        onSelect={() => onStageChange("category", cat)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-background/80 cursor-pointer focus:bg-background/10 focus:text-background"
                      >
                        {cat}
                        {isActive && <RiCheckLine className="h-3.5 w-3.5 text-chart-3" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ── Takedown Dropdown ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BarDropdownTrigger
                    fieldTitle="Takedown"
                    displayValue={displayTakedown}
                    isMixed={takedownState.isMixed}
                    isStaged={isTakedownStaged}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  sideOffset={12}
                  className="w-[200px] bg-foreground border-background/10 shadow-2xl rounded-xl p-1"
                >
                  {TAKEDOWN_OPTIONS.map((opt) => {
                    const isActive = displayTakedown === opt;
                    return (
                      <DropdownMenuItem
                        key={opt}
                        onSelect={() => onStageChange("takedown", opt)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-background/80 cursor-pointer focus:bg-background/10 focus:text-background"
                      >
                        {opt}
                        {isActive && <RiCheckLine className="h-3.5 w-3.5 text-chart-3" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* ── IP Asset Dropdown ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BarDropdownTrigger
                    fieldTitle="IP Asset"
                    displayValue="IP Asset"
                    isMixed={false}
                    isStaged={false}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  sideOffset={12}
                  className="w-[220px] bg-foreground border-background/10 shadow-2xl rounded-xl p-1"
                >
                  {IP_ASSET_OPTIONS.map((ip) => (
                    <DropdownMenuItem
                      key={ip}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-background/80 cursor-pointer focus:bg-background/10 focus:text-background"
                    >
                      {ip}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ── IP Certificate Dropdown ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BarDropdownTrigger
                    fieldTitle="IP Cert"
                    displayValue="IP Certificate"
                    isMixed={false}
                    isStaged={false}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  sideOffset={12}
                  className="w-[200px] bg-foreground border-background/10 shadow-2xl rounded-xl p-1"
                >
                  {IP_CERTIFICATE_OPTIONS.map((cert) => (
                    <DropdownMenuItem
                      key={cert}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-background/80 cursor-pointer focus:bg-background/10 focus:text-background"
                    >
                      {cert}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ── Site Code Dropdown ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <BarDropdownTrigger
                    fieldTitle="Site Code"
                    displayValue="Site Code"
                    isMixed={false}
                    isStaged={false}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  sideOffset={12}
                  className="w-[180px] bg-foreground border-background/10 shadow-2xl rounded-xl p-1"
                >
                  {SITE_CODE_OPTIONS.map((code) => (
                    <DropdownMenuItem
                      key={code}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-background/80 cursor-pointer focus:bg-background/10 focus:text-background"
                    >
                      {code}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Right: Label/Verdict + Apply/Unvalidate + Batch Edit (always visible) */}
        <div className="flex items-center gap-1 pl-2 border-l border-background/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BarDropdownTrigger
                fieldTitle="Label"
                displayValue={displayLabel}
                isMixed={labelState.isMixed}
                isStaged={isLabelStaged}
                isPrimary
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              sideOffset={12}
              className="w-56 bg-foreground border-background/10 text-background/90 shadow-2xl rounded-xl p-1"
            >
              {VERDICT_OPTIONS.map((l) => {
                const isActive = displayLabel === l.name;
                return (
                  <DropdownMenuItem
                    key={l.name}
                    onSelect={() => onStageChange("label", l.name)}
                    className="flex items-center gap-2 text-sm cursor-pointer rounded-lg px-3 py-2 focus:bg-background/10 focus:text-background"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${l.color}`} />
                    <span className="flex-1">{l.name}</span>
                    {isActive && <RiCheckLine className="h-3.5 w-3.5 text-chart-3" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasPending ? (
            <Button
              onClick={onApplyAll}
              className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-6 rounded-xl shadow-[0_0_15px_rgba(21,25,96,0.4)]"
            >
              <RiCheckLine className="w-4 h-4 mr-1.5" />
              Apply to {selectedCount} rows
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-8 border-background/20 bg-transparent text-background/80 hover:bg-background/10 hover:text-background text-xs font-semibold px-4 rounded-xl"
            >
              Unvalidate
            </Button>
          )}

          {/* Batch Edit trigger */}
          <div className="pl-1.5 border-l border-background/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBatchSheetOpen(true)}
              className="h-8 px-3 text-xs font-medium text-background/60 hover:text-background hover:bg-background/10 rounded-xl transition-colors"
            >
              <RiSettings4Line className="w-4 h-4 mr-1.5" />
              Batch Edit
            </Button>
          </div>
        </div>
      </div>

      {/* ── Batch Edit Side Sheet ── */}
      <Sheet open={isBatchSheetOpen} onOpenChange={setIsBatchSheetOpen}>
        <SheetContent
          side="right"
          className="sm:max-w-lg w-full flex flex-col p-0"
        >
          <SheetHeader className="border-b border-border px-6 py-4">
            <SheetTitle className="text-base font-semibold text-foreground">
              Batch Edit
            </SheetTitle>
            <SheetDescription className="text-sm text-background/50">
              Apply changes to{" "}
              <span className="font-medium text-foreground">
                {selectedCount}
              </span>{" "}
              selected items.
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="moderate" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-2 border-b border-border">
              <TabsList variant="line" className="w-full justify-start">
                <TabsTrigger value="moderate">Moderate</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="enforce">Enforce</TabsTrigger>
              </TabsList>
            </div>

            {/* ── Tab: Moderate ── */}
            <TabsContent
              value="moderate"
              className="flex-1 overflow-y-auto px-6 py-5"
            >
              <div className="space-y-4">
                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Tags
                  </label>
                  <Input placeholder="Add tags… (e.g. Priority, Escalated)" />
                </div>

                {/* Category + Takedown Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Category
                    </label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category…" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Takedown Status
                    </label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status…" />
                      </SelectTrigger>
                      <SelectContent>
                        {TAKEDOWN_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Label + Action to Apply */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Label
                    </label>
                    <Select>
                      <SelectTrigger className="w-full border-destructive/30 focus:ring-destructive">
                        <SelectValue placeholder="Select label…" />
                      </SelectTrigger>
                      <SelectContent>
                        {VERDICT_OPTIONS.map((v) => (
                          <SelectItem key={v.name} value={v.name}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full shrink-0 ${v.color}`}
                              />
                              {v.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Action to Apply
                    </label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select action…" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_OPTIONS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              </div>
            </TabsContent>

            {/* ── Tab: Details ── */}
            <TabsContent
              value="details"
              className="flex-1 overflow-y-auto px-6 py-5"
            >
              <div className="space-y-4">
                {/* Ships From + Ships To */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Ships From
                    </label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select country…" />
                      </SelectTrigger>
                      <SelectContent>
                        {GEO_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Ships To
                    </label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select country…" />
                      </SelectTrigger>
                      <SelectContent>
                        {GEO_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Account Geo + Items in Bundle */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Account Geo
                    </label>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select geo…" />
                      </SelectTrigger>
                      <SelectContent>
                        {GEO_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Items in Bundle
                    </label>
                    <Input type="number" placeholder="e.g. 1" min={1} />
                  </div>
                </div>

                {/* Product */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Product
                  </label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select product…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Comments */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Comments
                  </label>
                  <Textarea
                    placeholder="Add internal notes for these items…"
                    className="h-20 resize-none"
                  />
                </div>
              </div>
            </TabsContent>

            {/* ── Tab: Enforce ── */}
            <TabsContent
              value="enforce"
              className="flex-1 overflow-y-auto px-6 py-5"
            >
              <div className="space-y-4">
                {/* IP Asset */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    IP Asset
                  </label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select IP Asset…" />
                    </SelectTrigger>
                    <SelectContent>
                      {IP_ASSET_OPTIONS.map((ip) => (
                        <SelectItem key={ip} value={ip}>
                          {ip}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* IP Certificate */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    IP Certificate
                  </label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Certificate…" />
                    </SelectTrigger>
                    <SelectContent>
                      {IP_CERTIFICATE_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Site Code */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Site Code
                  </label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Site Code…" />
                    </SelectTrigger>
                    <SelectContent>
                      {SITE_CODE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Sticky Footer */}
          <SheetFooter className="border-t border-border px-6 py-4 flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsBatchSheetOpen(false)}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: wire up batch apply logic
                setIsBatchSheetOpen(false);
              }}
              className="px-6"
            >
              Apply to {selectedCount} items
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
