export interface ColumnDef {
  id: string;
  label: string;
  width: number;
  fixed?: boolean;
}

export const ALL_COLUMNS: ColumnDef[] = [
  { id: "checkbox", label: "", width: 50, fixed: true },
  { id: "image", label: "Image", width: 50 },
  { id: "title", label: "Title", width: 250 },
  { id: "postId", label: "Post ID", width: 180 },
  { id: "website", label: "Website", width: 180 },
  { id: "tags", label: "Tags", width: 200 },
  { id: "account", label: "Account", width: 180 },
  { id: "price", label: "Price", width: 180 },
  { id: "suspicious", label: "Suspicious", width: 150 },
  { id: "label", label: "Label", width: 150 },
  { id: "impact", label: "Impact Score", width: 150 },
  { id: "bundle", label: "Bundle Items", width: 150 },
  { id: "platGeo", label: "Platform Geo", width: 150 },
  { id: "acctGeo", label: "Account Geo", width: 150 },
  { id: "takedownDays", label: "Days Since TD", width: 150 },
  { id: "takedownDate", label: "Takedown Date", width: 180 },
  { id: "validation", label: "Validation Errors", width: 150 },
  { id: "ipCert", label: "IP Certificate", width: 150 },
  { id: "webCat", label: "Website Category", width: 150 },
  { id: "brand", label: "Listed Brand", width: 150 },
  { id: "shipsFrom", label: "Ships From", width: 150 },
  { id: "shipsTo", label: "Ships To", width: 220 },
  { id: "modDays", label: "Days Since Mod.", width: 150 },
  { id: "noticeDays", label: "Days Since Notice", width: 150 },
  { id: "volume", label: "Volume Sold", width: 150 },
  { id: "imgReasons", label: "Image Reasons", width: 150 },
  { id: "stock", label: "Stock", width: 150 },
  { id: "prodCat", label: "Product Category", width: 150 },
  { id: "crawlDate", label: "Crawling Date", width: 180 },
  { id: "lastCreated", label: "Last Created Date", width: 180 },
  { id: "actions", label: "", width: 50, fixed: true },
];

export const DEFAULT_VISIBLE = ALL_COLUMNS.map((c) => c.id);
export const DEFAULT_ORDER = ALL_COLUMNS.map((c) => c.id);
