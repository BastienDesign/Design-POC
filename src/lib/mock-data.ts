// ============================================================
// MOCK DATA & CONSTANTS — Brand Protection SaaS
// ============================================================

// --- Navigation ---
export const NAV_ITEMS = [
  { label: "Overview", href: "/overview", icon: "RiDashboardLine" },
  { label: "Performance", href: "/performance", icon: "RiBarChartBoxLine" },
  { label: "Explore", href: "/explore", icon: "RiSearchLine" },
  { label: "Ask Cortex", href: "/ask-cortex", icon: "RiSparkling2Line" },
  { label: "Moderation", href: "/moderation", icon: "RiShieldCheckLine" },
  { label: "Settings", href: "/settings", icon: "RiSettings3Line" },
] as const;

// --- Organizations ---
export const ORGANIZATIONS = [
  { id: "org-1", name: "Acme Corporation", logo: "A" },
  { id: "org-2", name: "Globex Industries", logo: "G" },
  { id: "org-3", name: "Wayne Enterprises", logo: "W" },
  { id: "org-4", name: "Stark Industries", logo: "S" },
] as const;

export const ACTIVE_ORG = ORGANIZATIONS[0];
export const ORG_COUNT = 14;

// --- Sub-Organizations (within a Program) ---
export const SUB_ORGANIZATIONS = [
  { id: "sub-1", name: "All Organizations", count: null },
  { id: "sub-2", name: "Jordan", count: 12_430 },
  { id: "sub-3", name: "Converse", count: 8_712 },
  { id: "sub-4", name: "Nike ACG", count: 3_215 },
  { id: "sub-5", name: "Hurley", count: 1_804 },
] as const;

// --- Current User ---
export const CURRENT_USER = {
  name: "Sarah Chen",
  email: "sarah.chen@acme.com",
  role: "Admin",
  avatar: null,
  initials: "SC",
};

// --- Breadcrumbs ---
export const BREADCRUMBS: Record<string, string[]> = {
  "/overview": ["Dashboard", "Overview"],
  "/performance": ["Dashboard", "Performance"],
  "/explore": ["Dashboard", "Explore"],
  "/ask-cortex": ["Dashboard", "Ask Cortex"],
  "/moderation": ["Dashboard", "Moderation"],
  "/settings": ["Dashboard", "Settings"],
};

// --- Explore: Listings Data ---
export type ListingStatus = "enforced" | "pending" | "monitoring" | "dismissed";
export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface Listing {
  id: string;
  imageUrl: string;
  website: string;
  status: ListingStatus;
  account: string;
  price: string;
  riskScore: number;
  riskLevel: RiskLevel;
  channels: string[];
  platform: string;
  geo: string;
  geoFlag: string;
  detectedAt: string;
}

export const LISTINGS: Listing[] = [
  {
    id: "LST-28491",
    imageUrl: "/placeholder-product.png",
    website: "fakeshop.example.com",
    status: "enforced",
    account: "seller_x92",
    price: "$49.99",
    riskScore: 94,
    riskLevel: "critical",
    channels: ["Marketplace", "Social"],
    platform: "Amazon",
    geo: "US",
    geoFlag: "🇺🇸",
    detectedAt: "2025-03-10",
  },
  {
    id: "LST-28492",
    imageUrl: "/placeholder-product.png",
    website: "brandcopy.store",
    status: "pending",
    account: "knock_off_ltd",
    price: "$24.50",
    riskScore: 87,
    riskLevel: "high",
    channels: ["Website"],
    platform: "Shopify",
    geo: "UK",
    geoFlag: "🇬🇧",
    detectedAt: "2025-03-11",
  },
  {
    id: "LST-28493",
    imageUrl: "/placeholder-product.png",
    website: "cheapgoods.cn",
    status: "monitoring",
    account: "shenzhen_trade",
    price: "$12.00",
    riskScore: 72,
    riskLevel: "high",
    channels: ["Marketplace"],
    platform: "AliExpress",
    geo: "CN",
    geoFlag: "🇨🇳",
    detectedAt: "2025-03-08",
  },
  {
    id: "LST-28494",
    imageUrl: "/placeholder-product.png",
    website: "replica-hub.net",
    status: "enforced",
    account: "replica_king",
    price: "$35.00",
    riskScore: 91,
    riskLevel: "critical",
    channels: ["Social", "Website"],
    platform: "Independent",
    geo: "DE",
    geoFlag: "🇩🇪",
    detectedAt: "2025-03-09",
  },
  {
    id: "LST-28495",
    imageUrl: "/placeholder-product.png",
    website: "bargain-deals.co",
    status: "dismissed",
    account: "authorized_reseller",
    price: "$44.99",
    riskScore: 18,
    riskLevel: "low",
    channels: ["Marketplace"],
    platform: "eBay",
    geo: "US",
    geoFlag: "🇺🇸",
    detectedAt: "2025-03-12",
  },
  {
    id: "LST-28496",
    imageUrl: "/placeholder-product.png",
    website: "luxfakes.paris",
    status: "pending",
    account: "lux_imports",
    price: "$89.00",
    riskScore: 82,
    riskLevel: "high",
    channels: ["Social"],
    platform: "Instagram",
    geo: "FR",
    geoFlag: "🇫🇷",
    detectedAt: "2025-03-13",
  },
  {
    id: "LST-28497",
    imageUrl: "/placeholder-product.png",
    website: "discountbrand.jp",
    status: "monitoring",
    account: "tokyo_trader",
    price: "$31.00",
    riskScore: 55,
    riskLevel: "medium",
    channels: ["Marketplace", "Website"],
    platform: "Rakuten",
    geo: "JP",
    geoFlag: "🇯🇵",
    detectedAt: "2025-03-07",
  },
  {
    id: "LST-28498",
    imageUrl: "/placeholder-product.png",
    website: "knockoffs-r-us.com",
    status: "enforced",
    account: "quick_deals",
    price: "$19.99",
    riskScore: 96,
    riskLevel: "critical",
    channels: ["Website"],
    platform: "Independent",
    geo: "US",
    geoFlag: "🇺🇸",
    detectedAt: "2025-03-06",
  },
];

// --- Explore: Filter Options ---
export const FILTER_OPTIONS = {
  status: ["All", "Enforced", "Pending", "Monitoring", "Dismissed"],
  riskLevel: ["All", "Critical", "High", "Medium", "Low"],
  platform: ["All", "Amazon", "eBay", "Shopify", "AliExpress", "Instagram", "Rakuten", "Independent"],
  geo: ["All", "US", "UK", "CN", "DE", "FR", "JP"],
  channels: ["All", "Marketplace", "Social", "Website"],
};

export const ACTIVE_FILTERS = [
  { label: "Status", value: "Enforced" },
  { label: "Risk", value: "High & Critical" },
  { label: "Date", value: "Last 30 days" },
];

// --- Moderation: KPI Cards ---
export interface KpiCard {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export const MODERATION_KPIS: KpiCard[] = [
  { label: "Risk Score", value: "87/100", trend: "up", trendValue: "+4" },
  { label: "Domain Age", value: "43 days", trend: "neutral" },
  { label: "SSL Status", value: "Invalid", trend: "down" },
  { label: "WHOIS Privacy", value: "Enabled", trend: "neutral" },
  { label: "Content Match", value: "94%", trend: "up", trendValue: "+2%" },
  { label: "Logo Detection", value: "Positive", trend: "up" },
  { label: "Price Deviation", value: "-62%", trend: "down", trendValue: "-8%" },
  { label: "Reports Filed", value: "3", trend: "up", trendValue: "+1" },
];

// --- Moderation: Domain Intelligence ---
export const DOMAIN_INTELLIGENCE = {
  registrar: "NameCheap, Inc.",
  registrationDate: "2025-01-28",
  expiryDate: "2026-01-28",
  nameservers: ["ns1.fakeshop.example.com", "ns2.fakeshop.example.com"],
  whoisPrivacy: true,
  registrantCountry: "Panama",
};

export const HOSTING_INFRASTRUCTURE = {
  ipAddress: "104.21.45.123",
  provider: "Cloudflare, Inc.",
  asn: "AS13335",
  location: "San Francisco, US",
  sslIssuer: "Let's Encrypt",
  sslExpiry: "2025-06-15",
  httpStatus: 200,
  cdnDetected: true,
};

// --- Settings: Users ---
export interface TeamUser {
  id: string;
  name: string;
  subtitle: string;
  email: string;
  roleLabel: string;
  role: "Admin" | "Editor" | "Viewer" | "Analyst";
  status: "active" | "invited";
  lastLogin: string;
  initials: string;
}

export const TEAM_USERS: TeamUser[] = [
  {
    id: "u-1",
    name: "Sarah Chen",
    subtitle: "Brand Protection Lead",
    email: "sarah.chen@acme.com",
    roleLabel: "Admin (Internal)",
    role: "Admin",
    status: "active",
    lastLogin: "2 hours ago",
    initials: "SC",
  },
  {
    id: "u-2",
    name: "Marcus Johnson",
    subtitle: "IP Enforcement",
    email: "m.johnson@acme.com",
    roleLabel: "Editor (Internal)",
    role: "Editor",
    status: "active",
    lastLogin: "1 day ago",
    initials: "MJ",
  },
  {
    id: "u-3",
    name: "Aisha Patel",
    subtitle: "Analytics & Reporting",
    email: "a.patel@acme.com",
    roleLabel: "Analyst (Internal)",
    role: "Analyst",
    status: "active",
    lastLogin: "3 hours ago",
    initials: "AP",
  },
  {
    id: "u-4",
    name: "Tom Williams",
    subtitle: "External Legal Counsel",
    email: "t.williams@lawfirm.com",
    roleLabel: "Viewer (External)",
    role: "Viewer",
    status: "active",
    lastLogin: "5 days ago",
    initials: "TW",
  },
  {
    id: "u-5",
    name: "Elena Rodriguez",
    subtitle: "Regional Manager — LATAM",
    email: "e.rodriguez@acme.com",
    roleLabel: "Editor (Internal)",
    role: "Editor",
    status: "invited",
    lastLogin: "—",
    initials: "ER",
  },
  {
    id: "u-6",
    name: "James Kim",
    subtitle: "Engineering",
    email: "j.kim@acme.com",
    roleLabel: "Admin (Internal)",
    role: "Admin",
    status: "active",
    lastLogin: "12 hours ago",
    initials: "JK",
  },
];

// --- Settings: Sub-navigation (grouped by section) ---
export const SETTINGS_NAV_SECTIONS = [
  {
    section: "Personal",
    items: [
      { label: "Profile", href: "/settings/profile", icon: "RiUserLine" },
      { label: "Preferences", href: "/settings/preferences", icon: "RiPaletteLine" },
    ],
  },
  {
    section: "Organizational",
    items: [
      { label: "General", href: "/settings/general", icon: "RiSettings3Line" },
      { label: "Users", href: "/settings", icon: "RiGroupLine" },
      { label: "Crawling", href: "/settings/crawling", icon: "RiRadarLine" },
      { label: "Moderation", href: "/settings/moderation", icon: "RiShieldCheckLine" },
      { label: "Enforce", href: "/settings/enforce", icon: "RiHammerLine" },
      { label: "IP Portfolio", href: "/settings/ip-portfolio", icon: "RiFileShield2Line" },
      { label: "Categories", href: "/settings/categories", icon: "RiPriceTag3Line" },
    ],
  },
];

// --- Ask Cortex: Chat History ---
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  richContent?: "table" | "chart" | null;
}

export const CHAT_HISTORY_GROUPS = [
  {
    label: "This week",
    items: [
      { id: "ch-1", title: "Enforcement stats for March", date: "Today" },
      { id: "ch-2", title: "Top counterfeit sellers analysis", date: "Yesterday" },
      { id: "ch-3", title: "Risk score breakdown by region", date: "Mar 12" },
    ],
  },
  {
    label: "This month",
    items: [
      { id: "ch-4", title: "Monthly takedown report", date: "Mar 8" },
      { id: "ch-5", title: "Platform comparison: Amazon vs eBay", date: "Mar 5" },
      { id: "ch-6", title: "DMCA filing success rates", date: "Mar 2" },
    ],
  },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Show me the enforcement stats for the last 6 months.",
    timestamp: "10:32 AM",
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      "Here's a breakdown of your enforcement activity over the past 6 months. The data shows a consistent upward trend in successful takedowns, with March showing the highest enforcement rate at 94%.",
    timestamp: "10:32 AM",
    richContent: "table",
  },
];

export const ENFORCEMENT_TABLE_DATA = [
  { month: "October", enforced: 142, pending: 38, dismissed: 12, rate: "74%" },
  { month: "November", enforced: 158, pending: 29, dismissed: 8, rate: "81%" },
  { month: "December", enforced: 167, pending: 31, dismissed: 15, rate: "78%" },
  { month: "January", enforced: 189, pending: 22, dismissed: 9, rate: "86%" },
  { month: "February", enforced: 201, pending: 18, dismissed: 7, rate: "89%" },
  { month: "March", enforced: 224, pending: 12, dismissed: 2, rate: "94%" },
];

export const FOLLOW_UP_QUESTIONS = [
  "Which platforms had the highest takedown rate?",
  "Compare enforcement speed across regions",
  "What's the average time to resolution?",
];

// --- Explore: Posts Grid Data ---
export type PostStatus = "down" | "up" | "redirected" | "unknown";
export type LabelType = "counterfeit" | "legitimate" | "suspicious" | "trademark infringement" | "unlabeled";

export interface ExplorePost {
  id: string;
  postId: string;
  title: string;
  imageUrl: string;
  status: PostStatus;
  website: string;
  websiteDomain: string;
  domainCount: number;
  accountName: string;
  accountTag: string;
  accountTagType: "counterfeit" | "legitimate" | "suspicious" | "unknown";
  price: string;
  pricePct: string;
  suspiciousCount: number;
  suspiciousReasons: string;
  label: LabelType;
  labelText: string;
  impactScore: number;
  bundleItems: number;
  platformGeo: string;
  accountGeo: string;
  daysSinceTakedown: number | null;
  takedownDate: string | null;
  validationErrors: string;
  ipCertificate: string;
  websiteCategory: string;
  listedBrand: string;
  shipsFrom: string;
  shipsTo: string[];
  daysSinceModeration: number;
  daysSinceNoticeSent: number | null;
  volumeSold: number;
  imageReasons: string;
  stock: string;
  productCategory: string;
  crawlingDate: string;
  lastCreatedDate: string;
  tags: string[];
}

// --- Explore: Posts Generator (50 rows) ---
const SEED_STATUSES: PostStatus[] = ["down", "up", "redirected", "unknown"];
const SEED_LABELS: { type: LabelType; text: string }[] = [
  { type: "counterfeit", text: "Counterfeit" },
  { type: "suspicious", text: "Suspicious" },
  { type: "legitimate", text: "Legitimate" },
  { type: "unlabeled", text: "Unlabeled" },
];
const SEED_TAG_TYPES: ExplorePost["accountTagType"][] = ["counterfeit", "suspicious", "legitimate", "unknown"];
const SEED_DOMAINS = ["ebay.com", "amazon.de", "shopify.com", "aliexpress.com", "ebay.co.uk", "zalando.de", "amazon.com", "etsy.com", "wish.com", "rakuten.co.jp"];
const SEED_BRANDS = ["Louis Vuitton", "Rolex", "Apple", "Nike", "Gucci", "Chanel", "Hermès", "Prada", "Dior", "Balenciaga"];
const SEED_TITLES = [
  "Luxury Designer Handbag — Monogram Canvas Tote Limited Edition 2025",
  "Premium Swiss Automatic Watch — Chronograph Stainless Steel 42mm",
  "Smartphone Flagship Pro Max 512GB Unlocked — International Version",
  "Running Shoes Air Zoom Performance — Authentic Retailer Exclusive",
  "Designer Crossbody Bag Replica — High Quality PU Leather Women Shoulder",
  "Eau de Parfum Branded Fragrance 100ml — Gift Set with Travel Spray",
  "Leather Belt Designer Buckle — Unisex Fashion Accessory Premium Grade",
  "Wireless Earbuds Pro — Active Noise Cancellation with Charging Case",
  "Silk Scarf Printed Logo — Luxury Brand Multicolor Square 90x90cm",
  "Sunglasses Aviator Classic — Polarized UV400 Gold Frame Brown Lens",
];
const SEED_ACCOUNTS = ["luxury_reseller_99", "watchworld_official", "techbargains_eu", "verified_retailer", "shenzhen_imports_88", "fragrance_house_uk", "fashion_outlet_de", "deal_hunter_23", "brand_discount_pro", "global_goods_hk"];
const SEED_GEOS = ["Germany", "China", "France", "United States", "United Kingdom", "Turkey", "Japan", "South Korea", "Italy", "Brazil"];
const SEED_CITIES = ["Shenzhen, CN", "Istanbul, TR", "Guangzhou, CN", "Portland, US", "London, UK", "Berlin, DE", "Paris, FR", "Tokyo, JP", "Milan, IT", "São Paulo, BR"];
const SEED_COUNTRIES = ["United States", "Germany", "France", "United Kingdom", "Italy", "Spain", "Netherlands", "Belgium", "Austria", "Switzerland", "Japan", "Australia", "Canada", "South Korea", "Brazil", "Mexico", "India", "Poland", "Sweden", "Ireland"];
const SEED_CATEGORIES = ["Handbags", "Watches", "Electronics", "Footwear", "Fragrances", "Accessories", "Apparel", "Jewelry", "Eyewear", "Cosmetics"];
const SEED_WEB_CATS = ["Marketplace", "Independent Store", "Authorized Dealer", "Social Commerce", "Fashion Marketplace", "Dropshipper"];
const SEED_CERTS = ["Let's Encrypt", "DigiCert", "Cloudflare", "AWS ACM", "GoDaddy", "Self-signed", "Comodo", "GlobalSign"];
const SEED_REASONS = ["Logo mismatch", "Deep discount", "Cloned listing", "Image reuse", "New seller", "Keyword stuffing", "Price anomaly", "Grey market pricing"];
const SEED_IMG_REASONS = ["Watermark detected", "Stock photo match", "Rendered mockup", "Logo overlay", "Cropped branding"];
const SEED_VALIDATION = ["None", "Missing GTIN", "Invalid SKU", "Trademark violation", "Missing barcode", "Duplicate EAN"];
const SEED_STOCK = ["In Stock", "Low Stock", "Out of Stock"];
const SEED_TAGS = ["amazon:b0fx", "premium_check", "manual_audit", "repeat_offender", "price_alert", "vip_brand", "seasonal", "escalated", "grey_market", "high_volume"];

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function generateExplorePosts(count: number): ExplorePost[] {
  return Array.from({ length: count }, (_, i) => {
    const s = i * 7; // spread seed
    const status = SEED_STATUSES[i % 4];
    const labelSeed = SEED_LABELS[i % 4];
    const tagType = SEED_TAG_TYPES[i % 4];
    const suspCount = Math.floor(seededRandom(s + 1) * 6);
    const reasons = Array.from({ length: suspCount }, (_, j) => pick(SEED_REASONS, s + j + 10)).join(", ");
    const imgReasonCount = Math.floor(seededRandom(s + 2) * 4);
    const imgReasons = Array.from({ length: imgReasonCount }, (_, j) => pick(SEED_IMG_REASONS, s + j + 20)).join(", ");
    const hasTakedown = status === "down" || status === "redirected";
    const daysTD = hasTakedown ? Math.floor(seededRandom(s + 3) * 30) + 1 : null;
    const shipsToCount = Math.floor(seededRandom(s + 4) * 12) + 2;
    const shipsTo = SEED_COUNTRIES.slice(0, shipsToCount);
    const noticeSent = hasTakedown ? Math.floor(seededRandom(s + 5) * 20) + 1 : null;

    return {
      id: `ep-${i + 1}`,
      postId: `${2168513 + i}`,
      title: pick(SEED_TITLES, s + 6),
      imageUrl: "",
      status,
      website: `${pick(["fake-shop", "brand-deals", "discount-outlet", "replica-hub", "grey-market", "bargain-zone", "deal-factory", "cheap-finds"], s + 7)}.${pick(["com", "net", "co.uk", "de", "cn", "store"], s + 8)}/product/${2168513 + i}`,
      websiteDomain: pick(SEED_DOMAINS, s + 9),
      domainCount: Math.floor(seededRandom(s + 10) * 20) + 1,
      accountName: pick(SEED_ACCOUNTS, s + 11),
      accountTag: labelSeed.text === "Unlabeled" ? "Unknown" : labelSeed.text,
      accountTagType: tagType,
      price: `${(seededRandom(s + 12) * 1500 + 10).toFixed(2).replace(".", ",")} €`,
      pricePct: `${Math.floor(seededRandom(s + 13) * 95)}%`,
      suspiciousCount: suspCount,
      suspiciousReasons: reasons,
      label: labelSeed.type,
      labelText: labelSeed.text,
      impactScore: Math.floor(seededRandom(s + 14) * 100),
      bundleItems: Math.floor(seededRandom(s + 15) * 10) + 1,
      platformGeo: pick(SEED_GEOS, s + 16),
      accountGeo: pick(SEED_GEOS, s + 17),
      daysSinceTakedown: daysTD,
      takedownDate: hasTakedown ? `2026-03-${String(Math.floor(seededRandom(s + 18) * 14) + 1).padStart(2, "0")}` : null,
      validationErrors: pick(SEED_VALIDATION, s + 19),
      ipCertificate: pick(SEED_CERTS, s + 20),
      websiteCategory: pick(SEED_WEB_CATS, s + 21),
      listedBrand: pick(SEED_BRANDS, s + 22),
      shipsFrom: pick(SEED_CITIES, s + 23),
      shipsTo,
      daysSinceModeration: Math.floor(seededRandom(s + 24) * 45) + 1,
      daysSinceNoticeSent: noticeSent,
      volumeSold: Math.floor(seededRandom(s + 25) * 5000),
      imageReasons: imgReasons,
      stock: pick(SEED_STOCK, s + 26),
      productCategory: pick(SEED_CATEGORIES, s + 27),
      crawlingDate: `2026-03-${String(Math.floor(seededRandom(s + 28) * 14) + 1).padStart(2, "0")}`,
      lastCreatedDate: `2026-0${Math.floor(seededRandom(s + 29) * 2) + 1}-${String(Math.floor(seededRandom(s + 30) * 28) + 1).padStart(2, "0")}`,
      tags: Array.from(
        { length: Math.floor(seededRandom(s + 31) * 5) },
        (_, j) => pick(SEED_TAGS, s + j + 32)
      ).filter((v, idx, arr) => arr.indexOf(v) === idx),
    };
  });
}

export const EXPLORE_POSTS: ExplorePost[] = generateExplorePosts(50);

export const EXPLORE_TABS = [
  { label: "Posts", count: "935867", active: true },
  { label: "Images", count: null, active: false },
  { label: "Websites", count: null, active: false },
  { label: "Accounts", count: null, active: false },
];

export const EXPLORE_ACTIVE_FILTERS = [
  { label: "Crawling Date", value: "Any date" },
  { label: "Channel", value: "All" },
];

// --- Explore: Images ---
export type ImageLabel = "counterfeit" | "suspicious" | "legitimate" | "unlabeled";

export interface ExploreImage {
  id: string;
  imageId: string;
  thumbnailUrl: string;
  postsCount: number;
  accountsCount: number;
  websitesCount: number;
  label: ImageLabel;
  labelText: string;
  firstSeen: string;
  similarity: number;
}

const IMAGE_LABELS: { type: ImageLabel; text: string }[] = [
  { type: "counterfeit", text: "Counterfeit" },
  { type: "suspicious", text: "Suspicious" },
  { type: "legitimate", text: "Legitimate" },
  { type: "unlabeled", text: "Unlabeled" },
];

function generateExploreImages(count: number): ExploreImage[] {
  return Array.from({ length: count }, (_, i) => {
    const s = i * 31;
    const lbl = IMAGE_LABELS[i % 4];
    const hue = Math.floor(seededRandom(s + 1) * 360);
    return {
      id: `img-${i + 1}`,
      imageId: `IMG-${String(7400100 + i)}`,
      thumbnailUrl: `https://placehold.co/400x400/${hue.toString(16).padStart(2, "0")}${Math.floor(seededRandom(s + 2) * 255).toString(16).padStart(2, "0")}${Math.floor(seededRandom(s + 3) * 255).toString(16).padStart(2, "0")}/ffffff?text=${i + 1}`,
      postsCount: Math.floor(seededRandom(s + 4) * 800) + 1,
      accountsCount: Math.floor(seededRandom(s + 5) * 120) + 1,
      websitesCount: Math.floor(seededRandom(s + 6) * 40) + 1,
      label: lbl.type,
      labelText: lbl.text,
      firstSeen: `2026-0${Math.floor(seededRandom(s + 7) * 3) + 1}-${String(Math.floor(seededRandom(s + 8) * 28) + 1).padStart(2, "0")}`,
      similarity: Math.floor(seededRandom(s + 9) * 40) + 60,
    };
  });
}

export const EXPLORE_IMAGES: ExploreImage[] = generateExploreImages(48);
