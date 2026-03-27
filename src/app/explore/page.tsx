"use client";

import { useState, useCallback, useMemo, useDeferredValue } from "react";
import { ExploreHeader } from "@/components/explore/explore-header";
import type { ActiveFilter } from "@/components/explore/explore-header";
import { ExploreTable } from "@/components/explore/explore-table";
import { ExploreGrid } from "@/components/explore/explore-grid";
import { ImagesTab } from "@/components/explore/images-tab";
import { PostSidePanel } from "@/components/explore/post-side-panel";
import { ExplorePagination } from "@/components/explore/explore-pagination";
import { BulkActionPill } from "@/components/explore/bulk-action-pill";
import type { PendingChanges } from "@/components/explore/bulk-action-pill";
import { WebsitesTable } from "@/components/explore/websites-table";
import { ModerationWorkspace } from "@/components/explore/moderation-workspace";
import { EXPLORE_POSTS, EXPLORE_IMAGES } from "@/lib/mock-data";
import type { ExplorePost } from "@/lib/mock-data";
import { DEFAULT_QUERY, getFieldDef } from "@/components/explore/advanced-filter-builder";
import type { FilterQuery, FilterRule } from "@/components/explore/advanced-filter-builder";
import type { FilterMode } from "@/components/explore/explore-filters-popover";
import { DEFAULT_VISIBLE, DEFAULT_ORDER } from "@/components/explore/explore-columns";
import type { ImageVisibleProperties } from "@/components/explore/images-view-options";

// ── Heuristic Engine: auto-categorize a search term ──
const KNOWN_BRANDS = ["rolex", "gucci", "prada", "hermès", "hermes", "nike", "apple", "louis vuitton", "chanel", "dior", "burberry", "cartier", "fendi", "balenciaga", "versace"];
const DOMAIN_HINTS = [".com", ".fr", ".net", ".org", ".co", ".io", ".de", ".uk", "www."];

function guessSearchCategory(term: string): { label: string; operator: string } {
  const t = term.trim().toLowerCase();
  if (/^(post-?)?\d{4,}$/i.test(t)) return { label: "Post ID", operator: "is" };
  if (/^[a-z]{2,4}-\d{3,}/i.test(t)) return { label: "ID", operator: "is" };
  if (DOMAIN_HINTS.some((h) => t.includes(h))) return { label: "Website", operator: "contains" };
  if (KNOWN_BRANDS.some((b) => t.includes(b))) return { label: "Brand", operator: "contains" };
  return { label: "Keyword", operator: "contains" };
}

const DEFAULT_IMAGE_PROPERTIES: ImageVisibleProperties = {
  imageId: true,
  postsCount: true,
  accountsCount: true,
  websitesCount: true,
  label: true,
  firstSeen: true,
};

let filterIdCounter = 0;

export default function ExplorePage() {
  const [posts, setPosts] = useState<ExplorePost[]>(EXPLORE_POSTS);
  const [activeTab, setActiveTab] = useState("Posts");
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [advancedQuery, setAdvancedQuery] = useState<FilterQuery>(DEFAULT_QUERY);
  const [filterMode, setFilterMode] = useState<FilterMode>("basic");
  const [filterOpen, setFilterOpen] = useState(false);

  // Posts view state
  const [postsLayout, setPostsLayout] = useState<"table" | "grid">("table");
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE);
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_ORDER);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Grid density (shared across Posts grid & Images grid)
  const [gridColumns, setGridColumns] = useState(4);

  // Images view state (lifted)
  const [imagesViewType, setImagesViewType] = useState<"grid" | "list">("grid");
  const [imagesVisibleProperties, setImagesVisibleProperties] =
    useState<ImageVisibleProperties>(DEFAULT_IMAGE_PROPERTIES);

  // Side panel state
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Bulk edit staging
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});

  // Moderation workspace state
  const [isModerating, setIsModerating] = useState(false);
  const [moderationQueue, setModerationQueue] = useState<ExplorePost[]>([]);
  const [currentModIndex, setCurrentModIndex] = useState(0);

  // ── Deferred filter state (non-blocking concurrent rendering) ──
  const deferredFilters = useDeferredValue(filters);
  const deferredAdvancedQuery = useDeferredValue(advancedQuery);
  const deferredSearchValue = useDeferredValue(searchValue);
  const isFiltering =
    filters !== deferredFilters ||
    advancedQuery !== deferredAdvancedQuery ||
    searchValue !== deferredSearchValue;

  // ── Advanced Filter: resolve a post field value by rule key ──
  function resolvePostField(post: ExplorePost, fieldKey: string): string | number | null {
    switch (fieldKey) {
      case "label": return post.labelText;
      case "moderation_status": return null; // pass-through for prototype
      case "takedown_status": return null;
      case "product_category": return post.productCategory;
      case "channel": return post.websiteCategory;
      case "enforcement": return null;
      case "account": return post.accountTag;
      case "stock": return post.stock;
      case "impact_score": return post.impactScore;
      case "price": return parseFloat(post.price.replace(/[^0-9.]/g, "")) || 0;
      case "risk_score": return post.impactScore;
      case "geo": return post.platformGeo;
      case "tags": return (post.tags ?? []).join(", ");
      case "contact_info": return null;
      default: return null;
    }
  }

  function evaluateRule(post: ExplorePost, rule: FilterRule): boolean {
    // Skip incomplete rules (no value for non-unary operators)
    if (rule.operator !== "is empty" && rule.operator !== "is not empty" && !rule.value) return true;

    const raw = resolvePostField(post, rule.field);
    if (raw === null) return true; // field not mapped, pass through

    const fieldDef = getFieldDef(rule.field);
    const isNumeric = fieldDef?.type === "number";

    if (rule.operator === "is empty") return raw === "" || raw === 0;
    if (rule.operator === "is not empty") return raw !== "" && raw !== 0;

    if (isNumeric) {
      const numVal = typeof raw === "number" ? raw : parseFloat(String(raw));
      const ruleNum = parseFloat(rule.value);
      if (isNaN(numVal) || isNaN(ruleNum)) return true;
      switch (rule.operator) {
        case "is": return numVal === ruleNum;
        case "is not": return numVal !== ruleNum;
        case "greater than": return numVal > ruleNum;
        case "less than": return numVal < ruleNum;
        default: return true;
      }
    }

    const strVal = String(raw).toLowerCase();
    const ruleVal = rule.value.toLowerCase();
    switch (rule.operator) {
      case "is": return strVal === ruleVal;
      case "is not": return strVal !== ruleVal;
      case "contains": return strVal.includes(ruleVal);
      case "does not contain": return !strVal.includes(ruleVal);
      default: return true;
    }
  }

  // ── Filter Engine (uses deferred state for non-blocking updates) ──
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Omnibar: comma-separated bulk search (OR logic across terms)
    const searchTerms = deferredSearchValue.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (searchTerms.length > 0) {
      result = result.filter((post) =>
        searchTerms.some(
          (term) =>
            post.id.toLowerCase().includes(term) ||
            post.postId.toLowerCase().includes(term) ||
            post.title.toLowerCase().includes(term) ||
            post.accountName.toLowerCase().includes(term) ||
            post.accountTag.toLowerCase().includes(term) ||
            post.websiteDomain.toLowerCase().includes(term) ||
            post.website.toLowerCase().includes(term) ||
            post.listedBrand.toLowerCase().includes(term) ||
            post.keyword.toLowerCase().includes(term) ||
            post.platformGeo.toLowerCase().includes(term) ||
            post.productCategory.toLowerCase().includes(term) ||
            post.tags.some((t) => t.toLowerCase().includes(term))
        )
      );
    }

    // Basic (chip) filters
    if (deferredFilters.length > 0) {
      result = result.filter((post) =>
        deferredFilters.every((f) => {
          const val = f.value.toLowerCase();

          // Search token chips: match against the guessed field(s)
          if (f.type === "search") {
            switch (f.label) {
              case "Post ID":
                return post.postId.toLowerCase().includes(val) || post.id.toLowerCase().includes(val);
              case "ID":
                return post.id.toLowerCase().includes(val) || post.postId.toLowerCase().includes(val);
              case "Website":
                return post.websiteDomain.toLowerCase().includes(val) || post.website.toLowerCase().includes(val);
              case "Brand":
                return post.listedBrand.toLowerCase().includes(val);
              case "Keyword":
              default:
                return (
                  post.id.toLowerCase().includes(val) ||
                  post.postId.toLowerCase().includes(val) ||
                  post.title.toLowerCase().includes(val) ||
                  post.accountName.toLowerCase().includes(val) ||
                  post.accountTag.toLowerCase().includes(val) ||
                  post.websiteDomain.toLowerCase().includes(val) ||
                  post.website.toLowerCase().includes(val) ||
                  post.listedBrand.toLowerCase().includes(val) ||
                  post.keyword.toLowerCase().includes(val) ||
                  post.tags.some((t) => t.toLowerCase().includes(val))
                );
            }
          }

          switch (f.label) {
            case "Label":
              return post.labelText.toLowerCase() === val;
            case "Moderation status":
            case "Moderation Method":
              return true;
            case "Takedown status":
              return true;
            case "Date":
            case "Crawling date":
              return true;
            case "Price": {
              const numPrice = parseFloat(post.price.replace(/[^0-9.]/g, ""));
              if (val.includes("under 50")) return numPrice < 50;
              if (val.includes("50")) return numPrice >= 50 && numPrice <= 200;
              if (val.includes("200")) return numPrice >= 200 && numPrice <= 500;
              if (val.includes("over 500")) return numPrice > 500;
              return true;
            }
            case "Stock":
              return post.stock.toLowerCase() === val;
            case "Items in Bundle": {
              if (val === "single") return post.bundleItems === 1;
              if (val.includes("2")) return post.bundleItems >= 2 && post.bundleItems <= 5;
              if (val.includes("6")) return post.bundleItems >= 6 && post.bundleItems <= 10;
              if (val.includes("10+")) return post.bundleItems > 10;
              return true;
            }
            case "Product Category":
              return post.productCategory.toLowerCase() === val;
            case "Estimated Geo":
              return val === "all regions" || post.platformGeo.toLowerCase().includes(val);
            case "Channel":
              return post.websiteCategory.toLowerCase().includes(val);
            case "Account":
              return post.accountTag.toLowerCase().includes(val) || post.accountTagType.toLowerCase().includes(val);
            case "Risk Score": {
              const s = post.impactScore;
              if (val.includes("critical")) return s >= 90;
              if (val.includes("high")) return s >= 70 && s < 90;
              if (val.includes("medium")) return s >= 40 && s < 70;
              if (val.includes("low")) return s < 40;
              return true;
            }
            case "Image Reasons":
              return val === "none"
                ? !post.imageReasons
                : (post.imageReasons ?? "").toLowerCase().includes(val);
            case "Enforcement":
            case "Tags":
            case "Contact Info":
              return true;
            default:
              return true;
          }
        })
      );
    }

    // Advanced filters
    const activeRules = deferredAdvancedQuery.rules.filter(
      (r) => r.operator === "is empty" || r.operator === "is not empty" || r.value
    );
    if (activeRules.length > 0) {
      const combine = deferredAdvancedQuery.logicalOperator === "AND"
        ? (post: ExplorePost) => activeRules.every((r) => evaluateRule(post, r))
        : (post: ExplorePost) => activeRules.some((r) => evaluateRule(post, r));
      result = result.filter(combine);
    }

    return result;
  }, [deferredFilters, posts, deferredAdvancedQuery, deferredSearchValue]);

  const tabCounts: Record<string, number> = {
    Posts: filteredPosts.length,
    Images: EXPLORE_IMAGES.length,
    Websites: 342,
    Accounts: 1_205,
  };

  const allRowIds = filteredPosts.map((p) => p.id);
  const allSelected = allRowIds.length > 0 && allRowIds.every((id) => selectedRows.includes(id));
  const someSelected = selectedRows.length > 0 && !allSelected;

  const selectedRowsData = useMemo(
    () => filteredPosts.filter((p) => selectedRows.includes(p.id)),
    [filteredPosts, selectedRows]
  );

  const selectedPostIndex = selectedPostId
    ? filteredPosts.findIndex((p) => p.id === selectedPostId)
    : -1;
  const selectedPost =
    selectedPostIndex >= 0 ? filteredPosts[selectedPostIndex] : null;

  function handleSelectAll(checked: boolean) {
    setSelectedRows(checked ? [...allRowIds] : []);
  }

  function handleSelectRow(id: string, checked: boolean) {
    setSelectedRows((prev) =>
      checked ? [...prev, id] : prev.filter((r) => r !== id)
    );
  }

  function handleRemoveFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function handleTokenizeSearch() {
    const raw = searchValue.trim();
    if (!raw) return;

    const terms = raw.split(",").map((t) => t.trim()).filter(Boolean);
    const newFilters: ActiveFilter[] = terms.map((term) => {
      const { label, operator } = guessSearchCategory(term);
      return {
        id: `search-${++filterIdCounter}`,
        type: "search" as const,
        label,
        operator,
        value: term,
      };
    });

    setFilters((prev) => [...prev, ...newFilters]);
    setSearchValue("");
  }

  function handleResetFilters() {
    setFilters([]);
    setSearchValue("");
    setAdvancedQuery(DEFAULT_QUERY);
    setFilterMode("basic");
  }

  function handleStageChange(field: keyof PendingChanges, value: string | string[]) {
    setPendingChanges((prev) => ({ ...prev, [field]: value }));
  }

  function handleApplyAll() {
    setPosts((prev) =>
      prev.map((post) => {
        if (!selectedRows.includes(post.id)) return post;
        const updated = { ...post };
        if (pendingChanges.label) {
          updated.labelText = pendingChanges.label;
          updated.label = pendingChanges.label.toLowerCase() as ExplorePost["label"];
        }
        if (pendingChanges.category) {
          updated.productCategory = pendingChanges.category;
        }
        return updated;
      })
    );
    setPendingChanges({});
    setSelectedRows([]);
  }

  function handleFilterValueChange(id: string, value: string) {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f))
    );
  }

  function handleSelectFilter(label: string, value: string, options: string[]) {
    // If a filter with the same label exists, update its value instead of duplicating
    setFilters((prev) => {
      const existing = prev.find((f) => f.type === "filter" && f.label === label);
      if (existing) {
        return prev.map((f) =>
          f.id === existing.id ? { ...f, value } : f
        );
      }
      return [
        ...prev,
        {
          id: `filter-${++filterIdCounter}`,
          type: "filter" as const,
          label,
          operator: "is",
          value,
          options,
        },
      ];
    });
  }

  const handlePrevPost = useCallback(() => {
    if (selectedPostIndex > 0) {
      setSelectedPostId(filteredPosts[selectedPostIndex - 1].id);
    }
  }, [selectedPostIndex, filteredPosts]);

  const handleNextPost = useCallback(() => {
    if (selectedPostIndex < filteredPosts.length - 1) {
      setSelectedPostId(filteredPosts[selectedPostIndex + 1].id);
    }
  }, [selectedPostIndex, filteredPosts]);

  function handleModerationPlay() {
    const queue =
      selectedRows.length > 0
        ? filteredPosts.filter((p) => selectedRows.includes(p.id))
        : filteredPosts;
    if (queue.length === 0) return;
    setModerationQueue(queue);
    setCurrentModIndex(0);
    setIsModerating(true);
  }

  function handleSingleModeration(post: ExplorePost) {
    setModerationQueue([post]);
    setCurrentModIndex(0);
    setIsModerating(true);
  }

  function handleModerationVerdict(postId: string, label: ExplorePost["label"], labelText: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, label, labelText } : p))
    );
  }

  if (isModerating) {
    return (
      <div className="h-[calc(100vh-72px)] w-full bg-white">
        <ModerationWorkspace
          queue={moderationQueue}
          currentIndex={currentModIndex}
          onNext={() => setCurrentModIndex((p) => Math.min(p + 1, moderationQueue.length - 1))}
          onPrev={() => setCurrentModIndex((p) => Math.max(p - 1, 0))}
          onExit={() => setIsModerating(false)}
          onVerdict={handleModerationVerdict}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-72px)] p-2 bg-neutral-50/50 overflow-hidden">

      {/* 1. TOP CONTROLS (Tabs & Buttons) — NO border-b, just margin */}
      <div className="shrink-0 mb-2">
        <ExploreHeader
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onFilterValueChange={handleFilterValueChange}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          onTokenizeSearch={handleTokenizeSearch}
          onSelectFilter={handleSelectFilter}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={tabCounts}
          postsLayout={postsLayout}
          onPostsLayoutChange={setPostsLayout}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={setVisibleColumns}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          imagesViewType={imagesViewType}
          onImagesViewTypeChange={setImagesViewType}
          imagesVisibleProperties={imagesVisibleProperties}
          onImagesVisiblePropertiesChange={setImagesVisibleProperties}
          gridColumns={gridColumns}
          onGridColumnsChange={setGridColumns}
          filteredCount={filteredPosts.length}
          onPlayModeration={handleModerationPlay}
          advancedQuery={advancedQuery}
          onAdvancedQueryChange={setAdvancedQuery}
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          onResetAll={handleResetFilters}
        />
      </div>

      {/* 2. NAKED CONTENT CANVAS */}
      <div className={`flex-1 flex flex-col min-h-0 bg-white overflow-hidden mb-2 transition-opacity duration-150 ${isFiltering ? "opacity-50" : "opacity-100"}`}>
        <div className="flex-1 overflow-auto min-h-0 custom-scrollbar">
          {activeTab === "Posts" && postsLayout === "table" && (
            <ExploreTable
              data={filteredPosts}
              selectedRows={selectedRows}
              allSelected={allSelected}
              someSelected={someSelected}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              visibleColumns={visibleColumns}
              columnOrder={columnOrder}
              onColumnOrderChange={setColumnOrder}
              onRowClick={setSelectedPostId}
              onResetFilters={handleResetFilters}
              pendingChanges={pendingChanges}
              onSingleModeration={handleSingleModeration}
            />
          )}
          {activeTab === "Posts" && postsLayout === "grid" && (
            <ExploreGrid
              data={filteredPosts}
              selectedRows={selectedRows}
              allSelected={allSelected}
              someSelected={someSelected}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              onRowClick={setSelectedPostId}
              onResetFilters={handleResetFilters}
              pendingChanges={pendingChanges}
              columns={gridColumns}
            />
          )}
          {activeTab === "Images" && (
            <ImagesTab
              viewType={imagesViewType}
              visibleProperties={imagesVisibleProperties}
              gridColumns={gridColumns}
            />
          )}
          {activeTab === "Websites" && (
            <WebsitesTable />
          )}
        </div>
      </div>

      {/* 3. DETACHED PAGINATION — sibling to table container */}
      {activeTab === "Posts" && <ExplorePagination />}

      {/* Post Side Panel (portal) */}
      <PostSidePanel
        post={selectedPost}
        open={selectedPost !== null}
        onClose={() => setSelectedPostId(null)}
        currentIndex={selectedPostIndex}
        totalCount={filteredPosts.length}
        onPrev={handlePrevPost}
        onNext={handleNextPost}
      />

      {/* FLOATING BULK ACTION PILL */}
      <BulkActionPill
        selectedCount={selectedRows.length}
        selectedRowsData={selectedRowsData}
        onClearSelection={() => {
          setSelectedRows([]);
          setPendingChanges({});
        }}
        pendingChanges={pendingChanges}
        onStageChange={handleStageChange}
        onApplyAll={handleApplyAll}
      />

    </div>
  );
}
