"use client";

import { useRef, useCallback, useState, useMemo } from "react";
import {
  RiExternalLinkLine,
  RiAlertLine,
  RiInformationLine,
  RiMoreLine,
  RiArrowRightSLine,
  RiSearchLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiExpandUpDownLine,
  RiFilter3Line,
} from "@remixicon/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExplorePost, PostStatus, LabelType } from "@/lib/mock-data";
import type { PendingChanges } from "./bulk-action-pill";
import type { ColumnDef } from "./explore-columns";
import { ALL_COLUMNS } from "./explore-columns";
import { ImageThumbnail } from "./image-thumbnail";

const STATUS_CONFIG: Record<
  PostStatus,
  { variant: "destructive" | "secondary" | "outline"; label: string; className?: string }
> = {
  down: { variant: "destructive", label: "Down" },
  up: { variant: "outline", label: "Up", className: "border-emerald-200 bg-emerald-50 text-emerald-600" },
  redirected: { variant: "secondary", label: "Redirect" },
  unknown: { variant: "secondary", label: "Unknown" },
};

const LABEL_COLORS: Record<LabelType, string> = {
  counterfeit: "bg-red-500",
  legitimate: "bg-emerald-500",
  suspicious: "bg-amber-500",
  "trademark infringement": "bg-orange-400",
  unlabeled: "bg-neutral-300",
};

const ACCOUNT_TAG_STYLES: Record<string, string> = {
  counterfeit: "border-red-200 bg-red-50 text-red-600",
  suspicious: "border-amber-200 bg-amber-50 text-amber-600",
  legitimate: "border-emerald-200 bg-emerald-50 text-emerald-600",
  unknown: "border-neutral-200 bg-neutral-50 text-neutral-500",
};

const STICKY = "sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e5e5]";

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

/** Extract a comparable value from a post for a given column id */
function getSortValue(post: ExplorePost, colId: string): string | number {
  switch (colId) {
    case "title": return post.title;
    case "postId": return post.postId;
    case "website": return post.websiteDomain;
    case "account": return post.accountName;
    case "price": return parseFloat(post.price.replace(/[^0-9.]/g, "")) || 0;
    case "suspicious": return post.suspiciousCount;
    case "label": return post.labelText;
    case "tags": return (post.tags ?? []).length;
    case "impact": return post.impactScore;
    case "bundle": return post.bundleItems;
    case "platGeo": return post.platformGeo;
    case "acctGeo": return post.accountGeo;
    case "takedownDays": return post.daysSinceTakedown ?? -1;
    case "takedownDate": return post.takedownDate ?? "";
    case "validation": return post.validationErrors;
    case "ipCert": return post.ipCertificate;
    case "webCat": return post.websiteCategory;
    case "brand": return post.listedBrand;
    case "shipsFrom": return post.shipsFrom;
    case "shipsTo": return post.shipsTo.length;
    case "modDays": return post.daysSinceModeration;
    case "noticeDays": return post.daysSinceNoticeSent ?? -1;
    case "volume": return post.volumeSold;
    case "imgReasons": return post.imageReasons ?? "";
    case "stock": return post.stock;
    case "prodCat": return post.productCategory;
    case "crawlDate": return post.crawlingDate;
    case "lastCreated": return post.lastCreatedDate;
    default: return "";
  }
}

/** Extract a filterable string from a post for a given column id */
function getFilterValue(post: ExplorePost, colId: string): string {
  switch (colId) {
    case "title": return post.title;
    case "postId": return post.postId;
    case "website": return post.websiteDomain;
    case "account": return post.accountName;
    case "price": return post.price;
    case "suspicious": return post.suspiciousReasons;
    case "label": return post.labelText;
    case "tags": return (post.tags ?? []).join(" ");
    case "impact": return String(post.impactScore);
    case "bundle": return String(post.bundleItems);
    case "platGeo": return post.platformGeo;
    case "acctGeo": return post.accountGeo;
    case "takedownDays": return post.daysSinceTakedown != null ? String(post.daysSinceTakedown) : "";
    case "takedownDate": return post.takedownDate ?? "";
    case "validation": return post.validationErrors;
    case "ipCert": return post.ipCertificate;
    case "webCat": return post.websiteCategory;
    case "brand": return post.listedBrand;
    case "shipsFrom": return post.shipsFrom;
    case "shipsTo": return post.shipsTo.join(" ");
    case "modDays": return String(post.daysSinceModeration);
    case "noticeDays": return post.daysSinceNoticeSent != null ? String(post.daysSinceNoticeSent) : "";
    case "volume": return String(post.volumeSold);
    case "imgReasons": return post.imageReasons ?? "";
    case "stock": return post.stock;
    case "prodCat": return post.productCategory;
    case "crawlDate": return post.crawlingDate;
    case "lastCreated": return post.lastCreatedDate;
    default: return "";
  }
}

/** Columns that should NOT get sort/filter (fixed utility columns) */
const NON_INTERACTIVE_COLS = new Set(["checkbox", "image", "actions"]);

interface ExploreTableProps {
  data: ExplorePost[];
  selectedRows: string[];
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  visibleColumns: string[];
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
  onRowClick?: (postId: string) => void;
  onResetFilters?: () => void;
  pendingChanges?: PendingChanges;
  onSingleModeration?: (post: ExplorePost) => void;
}

function TruncCell({ value, className }: { value: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`block w-full truncate cursor-default text-[13px] ${className ?? ""}`}>
          {value}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[400px]">
        <p>{value}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function wCls(w: number) {
  return `w-[${w}px] min-w-[${w}px] max-w-[${w}px]`;
}

function renderHeaderContent(col: ColumnDef) {
  if (col.id === "price") {
    return (
      <span className="flex items-center gap-1">
        Price <RiInformationLine className="h-3 w-3 text-muted-foreground" />
      </span>
    );
  }
  return col.label;
}

function renderCell(col: ColumnDef, post: ExplorePost, isSelected: boolean, onSelectRow: (id: string, checked: boolean) => void, staging?: PendingChanges | null, rowIndex?: number, onSingleMod?: (post: ExplorePost) => void) {
  const statusCfg = STATUS_CONFIG[post.status];

  switch (col.id) {
    case "checkbox":
      return (
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectRow(post.id, checked === true)}
        />
      );

    case "image":
      return <ImageThumbnail src={post.imageUrl} alt={post.title} id={post.postId} rowIndex={rowIndex} />;

    case "title":
      return <TruncCell value={post.title} className="font-medium text-foreground" />;

    case "postId":
      return (
        <div className="flex items-center gap-2 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSingleMod?.(post);
                }}
                className="min-w-0 flex-1 cursor-pointer truncate text-[13px] font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none transition-colors text-left"
              >
                {post.postId}
              </button>
            </TooltipTrigger>
            <TooltipContent>{post.postId}</TooltipContent>
          </Tooltip>
          <Badge
            variant={statusCfg.variant}
            className={`shrink-0 px-1.5 text-[10px] ${statusCfg.className ?? ""}`}
          >
            {statusCfg.label}
          </Badge>
        </div>
      );

    case "website":
      return (
        <div className="flex items-center gap-2 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex min-w-0 flex-1 cursor-pointer items-center gap-1 truncate text-[13px] text-blue-600 hover:underline">
                <span className="truncate">{post.websiteDomain}</span>
                <RiExternalLinkLine className="h-3 w-3 shrink-0 text-blue-400" />
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[320px]">
              <p className="break-all">{post.website}</p>
            </TooltipContent>
          </Tooltip>
          {post.domainCount > 1 && (
            <Badge variant="secondary" className="shrink-0 px-1.5 text-[10px]">
              {post.domainCount}+
            </Badge>
          )}
        </div>
      );

    case "account":
      return (
        <div className="flex items-center gap-2 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="min-w-0 flex-1 cursor-pointer truncate text-[13px] text-blue-600 hover:underline">
                {post.accountName}
              </span>
            </TooltipTrigger>
            <TooltipContent>{post.accountName}</TooltipContent>
          </Tooltip>
          <Badge
            variant="outline"
            className={`shrink-0 px-1.5 text-[10px] ${ACCOUNT_TAG_STYLES[post.accountTagType]}`}
          >
            {post.accountTag}
          </Badge>
        </div>
      );

    case "price":
      return (
        <div className="flex items-center gap-1.5">
          <span className="min-w-0 truncate text-[13px] font-medium text-foreground">{post.price}</span>
          <span className="shrink-0 text-xs font-semibold text-blue-500">{post.pricePct}</span>
        </div>
      );

    case "suspicious":
      return post.suspiciousCount > 0 ? (
        <div className="flex items-center gap-2 w-full">
          <div className="flex items-center gap-1 shrink-0">
            <RiAlertLine className="h-4 w-4 shrink-0 text-red-500" />
            <span className="text-[13px] font-medium text-foreground">{post.suspiciousCount}</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground cursor-default">
                {post.suspiciousReasons}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[300px]">
              <p>{post.suspiciousReasons}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <span className="text-[13px] text-muted-foreground">&mdash;</span>
      );

    case "label": {
      const pendingLabel = staging?.label ?? null;
      const displayLabel = pendingLabel ?? post.labelText;
      const isStaged = !!pendingLabel;
      const dotKey = (pendingLabel?.toLowerCase() ?? post.label) as LabelType;
      const dotColor = LABEL_COLORS[dotKey] ?? "bg-neutral-300";
      return (
        <div className={`flex items-center gap-1.5 ${isStaged ? "animate-pulse" : ""}`}>
          <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${dotColor}`} />
          <span className={`min-w-0 truncate text-[13px] ${isStaged ? "text-blue-600 font-semibold" : "text-foreground"}`}>
            {displayLabel}
            {isStaged && <span className="ml-1 text-[10px] uppercase tracking-tighter opacity-70">(Pending)</span>}
          </span>
        </div>
      );
    }

    case "tags": {
      const pendingTags = staging?.tags ?? null;
      const baseTags = post.tags ?? [];
      const displayTags = pendingTags ?? baseTags;
      const isTagsStaged = !!pendingTags;
      if (displayTags.length === 0) {
        return <span className="text-neutral-300 text-xs">&mdash;</span>;
      }
      return (
        <div className={`flex flex-wrap gap-1 items-center ${isTagsStaged ? "animate-pulse" : ""}`}>
          {displayTags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={`h-5 px-1.5 py-0 text-[10px] font-medium rounded-sm shadow-none shrink-0 ${
                isTagsStaged
                  ? "bg-blue-50 border border-blue-300 text-blue-600"
                  : "bg-neutral-100 border border-neutral-200 text-neutral-600"
              }`}
            >
              {tag.length > 12 ? `${tag.substring(0, 10)}...` : tag}
            </Badge>
          ))}
          {displayTags.length > 2 && (
            <Badge
              variant="outline"
              className={`h-5 px-1.5 py-0 text-[10px] font-medium rounded-sm shrink-0 ${
                isTagsStaged
                  ? "border-blue-300 text-blue-500"
                  : "border-neutral-200 text-neutral-400"
              }`}
            >
              +{displayTags.length - 2}
            </Badge>
          )}
        </div>
      );
    }

    case "impact":
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                post.impactScore >= 80 ? "bg-red-500" : post.impactScore >= 50 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${post.impactScore}%` }}
            />
          </div>
          <span className="text-[13px] font-medium text-foreground">{post.impactScore}</span>
        </div>
      );

    case "bundle":
      return <span className="text-[13px] text-foreground">{post.bundleItems}</span>;

    case "platGeo":
      return <TruncCell value={post.platformGeo} />;

    case "acctGeo":
      return <TruncCell value={post.accountGeo} />;

    case "takedownDays":
      return (
        <span className="text-[13px] text-foreground">
          {post.daysSinceTakedown !== null ? `${post.daysSinceTakedown}d` : <span className="text-muted-foreground">&mdash;</span>}
        </span>
      );

    case "takedownDate":
      return (
        <span className="text-[13px] text-foreground">
          {post.takedownDate ?? <span className="text-muted-foreground">&mdash;</span>}
        </span>
      );

    case "validation":
      return <TruncCell value={post.validationErrors} className={post.validationErrors === "None" ? "text-muted-foreground" : "text-foreground"} />;

    case "ipCert":
      return <TruncCell value={post.ipCertificate} />;

    case "webCat":
      return <TruncCell value={post.websiteCategory} />;

    case "brand":
      return <span className="text-[13px] font-medium text-foreground">{post.listedBrand}</span>;

    case "shipsFrom":
      return <TruncCell value={post.shipsFrom} />;

    case "shipsTo":
      return (
        <div className="flex items-center gap-1.5 w-full overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 truncate">
                {post.shipsTo.slice(0, 2).map((country) => (
                  <Badge
                    key={country}
                    variant="outline"
                    className="shrink-0 font-normal bg-neutral-50 text-neutral-600 truncate max-w-[80px] text-[10px]"
                  >
                    {country}
                  </Badge>
                ))}
                {post.shipsTo.length > 2 && (
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {post.shipsTo.length - 2}+
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[400px]">
              <p>{post.shipsTo.join(", ")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );

    case "modDays":
      return <span className="text-[13px] text-foreground">{post.daysSinceModeration}d</span>;

    case "noticeDays":
      return (
        <span className="text-[13px] text-foreground">
          {post.daysSinceNoticeSent !== null ? `${post.daysSinceNoticeSent}d` : <span className="text-muted-foreground">&mdash;</span>}
        </span>
      );

    case "volume":
      return <span className="text-[13px] font-medium text-foreground">{post.volumeSold.toLocaleString()}</span>;

    case "imgReasons":
      return post.imageReasons ? (
        <TruncCell value={post.imageReasons} />
      ) : (
        <span className="text-[13px] text-muted-foreground">&mdash;</span>
      );

    case "stock":
      return (
        <Badge
          variant="outline"
          className={`text-[10px] ${
            post.stock === "In Stock"
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : post.stock === "Low Stock"
                ? "border-amber-200 bg-amber-50 text-amber-600"
                : "border-neutral-200 bg-neutral-50 text-neutral-500"
          }`}
        >
          {post.stock}
        </Badge>
      );

    case "prodCat": {
      const pendingCat = staging?.category ?? null;
      const displayCat = pendingCat ?? post.productCategory;
      const isCatStaged = !!pendingCat;
      return (
        <span className={`block w-full truncate text-[13px] ${isCatStaged ? "text-blue-600 font-semibold animate-pulse" : "text-foreground"}`}>
          {displayCat}
          {isCatStaged && <span className="ml-1 text-[10px] uppercase tracking-tighter opacity-70">(Pending)</span>}
        </span>
      );
    }

    case "crawlDate":
      return <span className="text-[13px] text-foreground">{post.crawlingDate}</span>;

    case "lastCreated":
      return <span className="text-[13px] text-foreground">{post.lastCreatedDate}</span>;

    case "actions":
      return (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
          <RiMoreLine className="h-4 w-4" />
        </Button>
      );

    default:
      return null;
  }
}

export function ExploreTable({
  data,
  selectedRows,
  allSelected,
  someSelected,
  onSelectAll,
  onSelectRow,
  visibleColumns,
  columnOrder,
  onColumnOrderChange,
  onRowClick,
  onResetFilters,
  pendingChanges,
  onSingleModeration,
}: ExploreTableProps) {
  const dragColRef = useRef<string | null>(null);
  const dragOverColRef = useRef<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Sort columns by columnOrder, then filter by visibility
  const orderedCols = columnOrder
    .map((id) => ALL_COLUMNS.find((c) => c.id === id))
    .filter((c): c is ColumnDef => c !== undefined && visibleColumns.includes(c.id));

  // Column-filtered data
  const columnFilteredData = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v);
    if (activeFilters.length === 0) return data;
    return data.filter((post) =>
      activeFilters.every(([colId, query]) =>
        getFilterValue(post, colId).toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [data, columnFilters]);

  // Sorted data
  const processedData = useMemo(() => {
    if (!sortConfig) return columnFilteredData;
    const { key, direction } = sortConfig;
    return [...columnFilteredData].sort((a, b) => {
      const aVal = getSortValue(a, key);
      const bVal = getSortValue(b, key);
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [columnFilteredData, sortConfig]);

  function handleSort(colId: string) {
    setSortConfig((prev) => {
      if (!prev || prev.key !== colId) return { key: colId, direction: "asc" };
      if (prev.direction === "asc") return { key: colId, direction: "desc" };
      return null; // third click clears
    });
  }

  function handleColumnFilter(colId: string, value: string | null) {
    setColumnFilters((prev) => {
      if (!value) {
        const next = { ...prev };
        delete next[colId];
        return next;
      }
      return { ...prev, [colId]: value };
    });
  }

  const handleDragStart = useCallback((e: React.DragEvent, colId: string) => {
    dragColRef.current = colId;
    e.dataTransfer.effectAllowed = "move";
    // Subtle ghost: set opacity on the dragged element
    const el = e.currentTarget as HTMLElement;
    requestAnimationFrame(() => {
      el.style.opacity = "0.4";
    });
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = "1";
    dragColRef.current = null;
    dragOverColRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((colId: string) => {
    dragOverColRef.current = colId;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const sourceColId = dragColRef.current;
    if (!sourceColId || sourceColId === targetColId) return;

    const newOrder = [...columnOrder];
    const sourceIdx = newOrder.indexOf(sourceColId);
    const targetIdx = newOrder.indexOf(targetColId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    // Remove source and insert at target position
    newOrder.splice(sourceIdx, 1);
    newOrder.splice(targetIdx, 0, sourceColId);
    onColumnOrderChange(newOrder);
  }, [columnOrder, onColumnOrderChange]);

  if (data.length === 0) {
    return (
      <div className="flex-1 min-h-0 w-full border border-neutral-200 rounded-md bg-white shadow-sm mb-4">
        <div className="flex flex-col items-center justify-center w-full h-[450px] mx-auto">
          <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-full mb-4 ring-4 ring-neutral-50/50">
            <RiSearchLine className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">
            No results found
          </h3>
          <p className="text-sm text-neutral-500 mb-5 max-w-[350px] text-center">
            We couldn&apos;t find any data matching your current search and filter combination. Try adjusting your parameters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="h-8 border-neutral-200 text-neutral-700 bg-white shadow-sm hover:bg-neutral-50 font-medium"
          >
            Clear all filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-auto border border-neutral-200 rounded-md bg-white shadow-sm mb-4 relative">
        <Table className="w-full table-fixed min-w-[1400px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {orderedCols.map((col) => {
                const isDraggable = !col.fixed;
                const isInteractive = !NON_INTERACTIVE_COLS.has(col.id);
                const isSorted = sortConfig?.key === col.id;
                const hasFilter = !!columnFilters[col.id];

                /* ── Utility: Checkbox (Sticky Left) ── */
                if (col.id === "checkbox") {
                  return (
                    <TableHead
                      key={col.id}
                      className="sticky top-0 left-0 z-30 w-12 pl-4 bg-white border-r border-neutral-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                      style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                    >
                      <Checkbox
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onCheckedChange={(checked) => onSelectAll(checked === true)}
                      />
                    </TableHead>
                  );
                }

                /* ── Utility: Image (Sticky Left, offset by Checkbox) ── */
                if (col.id === "image") {
                  return (
                    <TableHead
                      key={col.id}
                      className="sticky top-0 left-[50px] z-30 w-16 px-2 text-center text-[10px] uppercase font-bold text-neutral-700 tracking-wider bg-white border-r border-neutral-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                      style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                    >
                      Image
                    </TableHead>
                  );
                }

                /* ── Utility: Actions (Sticky Right) ── */
                if (col.id === "actions") {
                  return (
                    <TableHead
                      key={col.id}
                      className="sticky top-0 right-0 z-30 w-10 px-2 bg-white border-l border-neutral-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                      style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                    />
                  );
                }

                /* ── Interactive data columns ── */
                return (
                  <TableHead
                    key={col.id}
                    className={`${STICKY} group/head select-none px-3`}
                    style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                    draggable={isDraggable}
                    onDragStart={isDraggable ? (e) => handleDragStart(e, col.id) : undefined}
                    onDragEnd={isDraggable ? handleDragEnd : undefined}
                    onDragOver={isDraggable ? handleDragOver : undefined}
                    onDragEnter={isDraggable ? () => handleDragEnter(col.id) : undefined}
                    onDrop={isDraggable ? (e) => handleDrop(e, col.id) : undefined}
                  >
                    {isInteractive ? (
                      <div className="flex items-center justify-between gap-1">
                        {/* Clickable Sort Area */}
                        <div
                          className="flex items-center gap-1 cursor-pointer flex-1 min-w-0"
                          onClick={() => handleSort(col.id)}
                        >
                          <span className="text-[10px] uppercase font-bold text-neutral-700 tracking-wider truncate">
                            {col.label}
                          </span>
                          <div className={`transition-opacity shrink-0 ${isSorted ? "opacity-100" : "opacity-0 group-hover/head:opacity-100"}`}>
                            {isSorted ? (
                              sortConfig.direction === "asc" ? (
                                <RiArrowUpSLine className="w-3.5 h-3.5 text-neutral-900" />
                              ) : (
                                <RiArrowDownSLine className="w-3.5 h-3.5 text-neutral-900" />
                              )
                            ) : (
                              <RiExpandUpDownLine className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                          </div>
                        </div>

                        {/* Column Filter Trigger */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 shrink-0 transition-opacity ${
                                hasFilter
                                  ? "text-blue-600 opacity-100"
                                  : "text-neutral-400 opacity-0 group-hover/head:opacity-100 data-[state=open]:opacity-100"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <RiFilter3Line className="w-3 h-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2 shadow-xl border-neutral-200" align="start">
                            <div className="space-y-2">
                              <h4 className="text-[10px] uppercase font-bold text-neutral-400 px-1">
                                Filter {col.label}
                              </h4>
                              <input
                                className="w-full h-8 px-2 text-xs bg-neutral-50 border border-neutral-200 rounded outline-none focus:ring-1 focus:ring-neutral-900"
                                placeholder="Filter..."
                                value={columnFilters[col.id] ?? ""}
                                onChange={(e) => handleColumnFilter(col.id, e.target.value)}
                              />
                              {hasFilter && (
                                <Button
                                  variant="ghost"
                                  className="w-full h-7 text-[10px] text-red-500 hover:text-red-600 justify-start px-1"
                                  onClick={() => handleColumnFilter(col.id, null)}
                                >
                                  Clear filter
                                </Button>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ) : (
                      renderHeaderContent(col)
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.map((post, rowIdx) => {
                const isSelected = selectedRows.includes(post.id);
                return (
                  <TableRow
                    key={post.id}
                    data-state={isSelected ? "selected" : undefined}
                    className="group border-b border-neutral-100 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("button, [role=checkbox], a, input")) return;
                      onRowClick?.(post.id);
                    }}
                  >
                    {orderedCols.map((col) => {
                      /* ── Sticky: Checkbox ── */
                      if (col.id === "checkbox") {
                        return (
                          <TableCell
                            key={col.id}
                            className="py-3 pl-4 sticky left-0 z-20 bg-white border-r border-neutral-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-neutral-50 data-[state=selected]:bg-muted"
                            style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                          >
                            {renderCell(col, post, isSelected, onSelectRow, isSelected ? pendingChanges : null, rowIdx, onSingleModeration)}
                          </TableCell>
                        );
                      }

                      /* ── Sticky: Image ── */
                      if (col.id === "image") {
                        return (
                          <TableCell
                            key={col.id}
                            className="py-3 px-2 sticky left-[50px] z-20 bg-white border-r border-neutral-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-neutral-50 data-[state=selected]:bg-muted"
                            style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                          >
                            {renderCell(col, post, isSelected, onSelectRow, isSelected ? pendingChanges : null, rowIdx, onSingleModeration)}
                          </TableCell>
                        );
                      }

                      /* ── Sticky: Actions ── */
                      if (col.id === "actions") {
                        return (
                          <TableCell
                            key={col.id}
                            className="py-3 pr-3 sticky right-0 z-20 bg-white border-l border-neutral-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-neutral-50 data-[state=selected]:bg-muted"
                            style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                          >
                            <div className="flex items-center justify-center text-neutral-400 group-hover:text-neutral-900">
                              <RiArrowRightSLine className="h-5 w-5" />
                            </div>
                          </TableCell>
                        );
                      }

                      /* ── Standard data cells ── */
                      return (
                        <TableCell
                          key={col.id}
                          className="py-3 px-3 whitespace-nowrap bg-white"
                          style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                        >
                          {renderCell(col, post, isSelected, onSelectRow, isSelected ? pendingChanges : null, rowIdx, onSingleModeration)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
