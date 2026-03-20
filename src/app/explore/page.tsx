"use client";

import { useState, useCallback, useMemo } from "react";
import { ExploreHeader } from "@/components/explore/explore-header";
import type { ActiveFilter } from "@/components/explore/explore-header";
import { ExploreTable } from "@/components/explore/explore-table";
import { ExploreGrid } from "@/components/explore/explore-grid";
import { ImagesTab } from "@/components/explore/images-tab";
import { PostSidePanel } from "@/components/explore/post-side-panel";
import { ExplorePagination } from "@/components/explore/explore-pagination";
import { BulkActionPill } from "@/components/explore/bulk-action-pill";
import type { PendingChanges } from "@/components/explore/bulk-action-pill";
import { ModerationWorkspace } from "@/components/explore/moderation-workspace";
import { EXPLORE_POSTS, EXPLORE_IMAGES } from "@/lib/mock-data";
import type { ExplorePost } from "@/lib/mock-data";
import { DEFAULT_VISIBLE, DEFAULT_ORDER } from "@/components/explore/explore-columns";
import type { ImageVisibleProperties } from "@/components/explore/images-view-options";

// Maps the search field selector value to the ExplorePost field(s) to match against
const SEARCH_FIELD_MAP: Record<string, (post: ExplorePost, query: string) => boolean> = {
  "post-id": (post, q) => post.postId.toLowerCase().includes(q),
  "image-id": (post, q) => post.id.toLowerCase().includes(q),
  "account-website-id": (post, q) => post.websiteDomain.toLowerCase().includes(q),
  "account-poster-id": (post, q) => post.accountName.toLowerCase().includes(q),
  "cluster-id": (post, q) => post.id.toLowerCase().includes(q),
};

// Human-readable labels for search field keys
const SEARCH_FIELD_LABELS: Record<string, string> = {
  "post-id": "Post ID",
  "image-id": "Image ID",
  "account-website-id": "Account Website ID",
  "account-poster-id": "Account Poster ID",
  "cluster-id": "Cluster ID",
};

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
  const [searchField, setSearchField] = useState("post-id");
  const [searchValue, setSearchValue] = useState("");

  // Posts view state
  const [postsLayout, setPostsLayout] = useState<"table" | "grid">("table");
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE);
  const [columnOrder, setColumnOrder] = useState<string[]>(DEFAULT_ORDER);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

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

  // ── Filter Engine ──
  const filteredPosts = useMemo(() => {
    if (filters.length === 0) return posts;

    return posts.filter((post) =>
      filters.every((f) => {
        if (f.type === "search") {
          const matcher = SEARCH_FIELD_MAP[f.label === "Post ID" ? "post-id"
            : f.label === "Image ID" ? "image-id"
            : f.label === "Account Website ID" ? "account-website-id"
            : f.label === "Account Poster ID" ? "account-poster-id"
            : "cluster-id"];
          return matcher ? matcher(post, f.value.toLowerCase()) : true;
        }
        // Standard filter chips — match against known post fields
        const val = f.value.toLowerCase();
        switch (f.label) {
          case "Label":
            return post.labelText.toLowerCase() === val;
          case "Moderation status":
          case "Moderation Method":
            return true; // No direct mock field — pass through for prototype
          case "Takedown status":
            return true; // Pass through
          case "Date":
          case "Crawling date":
            return true; // Date filtering is a pass-through for the vibe prototype
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
            return true; // No direct mock field — pass through
          default:
            return true;
        }
      })
    );
  }, [filters, posts]);

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

  function handleResetFilters() {
    setFilters([]);
    setSearchValue("");
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

  function handleApplySearch() {
    const trimmed = searchValue.trim();
    if (!trimmed) return;

    const newFilter: ActiveFilter = {
      id: `search-${++filterIdCounter}`,
      type: "search",
      label: SEARCH_FIELD_LABELS[searchField] ?? searchField,
      operator: "is",
      value: trimmed,
    };

    setFilters((prev) => [...prev, newFilter]);
    setSearchValue("");
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
      <div className="relative h-full">
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
    <div className="flex flex-col h-full w-full min-w-0 overflow-hidden bg-white">
      {/* Header: natural height, never scrolls */}
      <div className="shrink-0 w-full min-w-0 px-4 pt-4">
        <ExploreHeader
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onFilterValueChange={handleFilterValueChange}
          searchField={searchField}
          onSearchFieldChange={setSearchField}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          onApplySearch={handleApplySearch}
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
          filteredCount={filteredPosts.length}
          onPlayModeration={handleModerationPlay}
        />
      </div>

      {/* Content: fills remaining height, scrolls confined here */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col px-4 pt-4 pb-0">
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
          />
        )}
        {activeTab === "Images" && (
          <ImagesTab
            viewType={imagesViewType}
            visibleProperties={imagesVisibleProperties}
          />
        )}
      </div>

      {/* Pagination: pinned to bottom */}
      {activeTab === "Posts" && <ExplorePagination />}

      {/* Post Side Panel */}
      {/* Post Side Panel */}
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
