"use client";

import { memo, useState, useMemo } from "react";
import {
  RiGlobalLine,
  RiFileTextLine,
  RiPulseLine,
  RiMoreLine,
  RiArrowDownSLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiInformationLine,
  RiRobot2Line,
  RiShieldCheckLine,
  RiShieldLine,
  RiTimeLine,
  RiAddLine,
  RiLockLine,
  RiTranslate,
  RiMessage3Line,
  RiSendPlaneLine,
  RiNodeTree,
  RiCloseLine,
  RiPercentLine,
  RiAlertLine,
  RiAlertFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiExternalLinkLine,
  RiSettings3Line,
  RiSearchLine,
  RiCheckboxMultipleLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNetworkStore } from "@/lib/network-store";
import {
  NetworkTab,
  type NetworkEntity as NetworkTabEntity,
} from "@/components/moderation/network-tab";

/* ─── Risk Tile Types & Styling ─── */

type RiskLevel = "high" | "medium" | "low";

interface WebsiteRiskTile {
  key: string;
  level: RiskLevel;
  label: string;
  desc: string;
  icon: typeof RiAlertFill;
  /** Which DataPoint labels this tile highlights */
  fields?: string[];
}

const RISK_TILE_STYLES: Record<RiskLevel, { bg: string; border: string; icon: string; label: string; desc: string }> = {
  high: { bg: "bg-red-50", border: "border-red-100", icon: "text-red-600", label: "text-red-800", desc: "text-red-900" },
  medium: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600", label: "text-amber-800", desc: "text-amber-900" },
  low: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600", label: "text-emerald-800", desc: "text-emerald-900" },
};

const WEBSITE_RISK_TILES: WebsiteRiskTile[] = [
  { key: "newDomain", level: "high", label: "New Domain", desc: "< 30 days old", icon: RiAlertFill, fields: ["Creation Date"] },
  { key: "suspiciousKeywords", level: "high", label: "Suspicious Keywords", desc: "Brand stuffing", icon: RiAlertFill, fields: ["Meta Keywords"] },
  { key: "registrarFlagged", level: "medium", label: "Registrar Flagged", desc: "Known risky host", icon: RiErrorWarningFill, fields: ["Registrar"] },
  { key: "zeroTrafficRank", level: "medium", label: "Zero Traffic Rank", desc: "Unranked globally", icon: RiErrorWarningFill, fields: ["Global Rank"] },
  { key: "geoAnomaly", level: "high", label: "Geo Anomaly", desc: "ID vs Traffic mismatch", icon: RiAlertFill, fields: ["Estimated Geo"] },
  { key: "sslValid", level: "low", label: "SSL Valid", desc: "Let's Encrypt", icon: RiInformationFill, fields: [] },
];

/** Build a field→risk lookup from tiles */
function buildFieldRisks(tiles: WebsiteRiskTile[]): Record<string, RiskLevel> {
  const map: Record<string, RiskLevel> = {};
  for (const tile of tiles) {
    for (const field of tile.fields ?? []) {
      map[field] = tile.level;
    }
  }
  return map;
}

const RISK_VALUE_STYLES: Record<RiskLevel, string> = {
  high: "font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded w-fit border border-red-100",
  medium: "font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded w-fit border border-orange-100",
  low: "font-medium text-neutral-900",
};

const INSIGHT_SIGNALS = [
  { id: "newDomain", label: "New Domain", desc: "Flags domains registered recently." },
  { id: "suspiciousKeywords", label: "Suspicious Keywords", desc: "Detects brand stuffing in meta tags." },
  { id: "registrarFlagged", label: "Registrar Flagged", desc: "Known bulletproof or risky registrars." },
  { id: "zeroTrafficRank", label: "Zero Traffic Rank", desc: "Flags unranked or zero-traffic domains." },
  { id: "geoAnomaly", label: "Geo Anomaly", desc: "Detects geo mismatches in traffic vs registration." },
  { id: "sslValid", label: "SSL Valid", desc: "Checks SSL certificate validity." },
] as const;

type InsightPrefKey = (typeof INSIGHT_SIGNALS)[number]["id"];

const DEFAULT_INSIGHT_PREFS: Record<InsightPrefKey, boolean> = {
  newDomain: true,
  suspiciousKeywords: true,
  registrarFlagged: true,
  zeroTrafficRank: true,
  geoAnomaly: true,
  sslValid: true,
};

/* ─── Mock Data ─── */

const VALIDATION_HISTORY = [
  {
    id: 1,
    action: "Moderated",
    actor: "System",
    timestamp: "31 Mar 2026, 09:30 (GMT+02:00)",
    type: "auto" as const,
    ruleName: "Rule #42: High-Risk Keyword Match",
    checks: 1,
  },
  {
    id: 2,
    action: "Checked",
    actor: "uyuusaf",
    timestamp: "31 Mar 2026, 09:35 (GMT+02:00)",
    type: "human" as const,
    checks: 2,
  },
  {
    id: 3,
    action: "Validated",
    actor: "uyuusaf",
    timestamp: "31 Mar 2026, 09:39 (GMT+02:00)",
    type: "human" as const,
    checks: 3,
  },
];

interface NetworkEntity {
  id: string;
  type: "website" | "image" | "post";
  name: string;
  geo: string;
  risk: number;
  thumbnail: string;
  sharedSignals: string[];
}

const NETWORK_ENTITIES: NetworkEntity[] = [
  {
    id: "WEB#3044171",
    name: "luxbags-outlet.com",
    risk: 94,
    type: "website",
    geo: "CN",
    thumbnail: "LB",
    sharedSignals: [
      "SSL cert fingerprint matches parent",
      "Identical Cloudflare zone config",
      "Overlapping WHOIS registrant org",
      "Same Google Analytics tracking ID",
    ],
  },
  {
    id: "WEB#3591353",
    name: "tinkerlust-replica.shop",
    risk: 91,
    type: "website",
    geo: "ID",
    thumbnail: "TR",
    sharedSignals: [
      "Same IP subnet (104.21.x.x)",
      "Identical DOM structure hash",
      "Shared favicon fingerprint",
    ],
  },
  {
    id: "WEB#2871029",
    name: "designer-deals.net",
    risk: 87,
    type: "website",
    geo: "TR",
    thumbnail: "DD",
    sharedSignals: [
      "Overlapping WHOIS registrant org",
      "Same nameserver cluster",
      "Identical product image set",
    ],
  },
  {
    id: "IMG#8821",
    name: "product_hero_01.jpg",
    risk: 78,
    type: "image",
    geo: "—",
    thumbnail: "IM",
    sharedSignals: [
      "pHash near-duplicate of parent listing hero",
      "EXIF GPS coords match factory in Shenzhen",
      "Watermark removed via inpainting (detected)",
    ],
  },
  {
    id: "IMG#8822",
    name: "logo_watermark.png",
    risk: 72,
    type: "image",
    geo: "—",
    thumbnail: "IM",
    sharedSignals: [
      "Brand logo modified — kerning delta 2px",
      "Color profile mismatch vs. official asset",
    ],
  },
  {
    id: "WEB#1982744",
    name: "preloved-luxe.co",
    risk: 68,
    type: "website",
    geo: "SG",
    thumbnail: "PL",
    sharedSignals: [
      "Shared Cloudflare SSL certificate",
      "Overlapping product catalog (73% match)",
    ],
  },
  {
    id: "POST#44102",
    name: "IG @luxdeals_id — Carousel",
    risk: 65,
    type: "post",
    geo: "ID",
    thumbnail: "PO",
    sharedSignals: [
      "Seller handle linked to WEB#3591353 via bio URL",
      "Reused product images from parent domain",
      "Pricing anomaly vs. brand MSRP (−84%)",
    ],
  },
  {
    id: "WEB#4120588",
    name: "bags-authentic.store",
    risk: 59,
    type: "website",
    geo: "MY",
    thumbnail: "BA",
    sharedSignals: [
      "Same payment gateway merchant ID",
      "Identical TOS page content hash",
    ],
  },
  {
    id: "POST#44210",
    name: "FB Marketplace — Listing #8812",
    risk: 52,
    type: "post",
    geo: "US",
    thumbnail: "PO",
    sharedSignals: [
      "Seller account created same day as WEB#2871029",
      "Shipping origin mismatch (listed US, routes via CN)",
    ],
  },
  {
    id: "WEB#5503912",
    name: "handbag-clearance.xyz",
    risk: 45,
    type: "website",
    geo: "RU",
    thumbnail: "HC",
    sharedSignals: [
      "Partial product catalog overlap (31% match)",
    ],
  },
  // ─── Additional websites for stress testing ───
  { id: "WEB#6001001", name: "luxe-factory-outlet.com", risk: 92, type: "website", geo: "CN", thumbnail: "LF", sharedSignals: ["Identical Cloudflare zone config", "Same Google Analytics tracking ID"] },
  { id: "WEB#6001002", name: "brand-bags-direct.shop", risk: 90, type: "website", geo: "HK", thumbnail: "BB", sharedSignals: ["SSL cert fingerprint matches parent", "Overlapping WHOIS registrant org"] },
  { id: "WEB#6001003", name: "replica-luxe.store", risk: 89, type: "website", geo: "CN", thumbnail: "RL", sharedSignals: ["Same IP subnet (104.21.x.x)", "Identical DOM structure hash"] },
  { id: "WEB#6001004", name: "designerbags-sale.net", risk: 88, type: "website", geo: "TR", thumbnail: "DS", sharedSignals: ["Same nameserver cluster", "Overlapping product catalog (68% match)"] },
  { id: "WEB#6001005", name: "outlet-luxury-goods.com", risk: 87, type: "website", geo: "ID", thumbnail: "OL", sharedSignals: ["Shared favicon fingerprint", "Same payment gateway merchant ID"] },
  { id: "WEB#6001006", name: "tinkerlust-deals.co", risk: 86, type: "website", geo: "SG", thumbnail: "TD", sharedSignals: ["Identical TOS page content hash"] },
  { id: "WEB#6001007", name: "cheap-authentic-bags.com", risk: 85, type: "website", geo: "MY", thumbnail: "CA", sharedSignals: ["Overlapping WHOIS registrant org", "Same Cloudflare SSL certificate"] },
  { id: "WEB#6001008", name: "premium-replica-hub.net", risk: 84, type: "website", geo: "CN", thumbnail: "PR", sharedSignals: ["Same Google Analytics tracking ID", "Identical product image set"] },
  { id: "WEB#6001009", name: "lux-bags-wholesale.shop", risk: 83, type: "website", geo: "VN", thumbnail: "LW", sharedSignals: ["Same IP subnet (104.21.x.x)"] },
  { id: "WEB#6001010", name: "branded-goods-asia.com", risk: 82, type: "website", geo: "TH", thumbnail: "BG", sharedSignals: ["Overlapping product catalog (55% match)", "Same nameserver cluster"] },
  { id: "WEB#6001011", name: "fashion-outlet-direct.co", risk: 81, type: "website", geo: "PH", thumbnail: "FO", sharedSignals: ["Identical Cloudflare zone config"] },
  { id: "WEB#6001012", name: "handbag-emporium.xyz", risk: 79, type: "website", geo: "RU", thumbnail: "HE", sharedSignals: ["Shared favicon fingerprint", "Same payment gateway merchant ID"] },
  { id: "WEB#6001013", name: "luxe-replica-market.com", risk: 78, type: "website", geo: "UA", thumbnail: "LR", sharedSignals: ["SSL cert fingerprint matches parent"] },
  { id: "WEB#6001014", name: "designer-knockoffs.shop", risk: 77, type: "website", geo: "CN", thumbnail: "DK", sharedSignals: ["Identical DOM structure hash", "Same Google Analytics tracking ID"] },
  { id: "WEB#6001015", name: "luxury-clearance-hq.net", risk: 76, type: "website", geo: "IN", thumbnail: "LC", sharedSignals: ["Overlapping WHOIS registrant org"] },
  { id: "WEB#6001016", name: "auth-bags-store.com", risk: 75, type: "website", geo: "BR", thumbnail: "AB", sharedSignals: ["Same nameserver cluster", "Partial product catalog overlap (42% match)"] },
  { id: "WEB#6001017", name: "preloved-designer.co", risk: 74, type: "website", geo: "JP", thumbnail: "PD", sharedSignals: ["Shared Cloudflare SSL certificate"] },
  { id: "WEB#6001018", name: "outlet-branded.shop", risk: 73, type: "website", geo: "KR", thumbnail: "OB", sharedSignals: ["Same IP subnet (104.21.x.x)", "Identical TOS page content hash"] },
  { id: "WEB#6001019", name: "genuine-bags-sale.net", risk: 71, type: "website", geo: "AE", thumbnail: "GB", sharedSignals: ["Same payment gateway merchant ID"] },
  { id: "WEB#6001020", name: "fashion-replica-zone.com", risk: 70, type: "website", geo: "CN", thumbnail: "FR", sharedSignals: ["Overlapping WHOIS registrant org", "Same Google Analytics tracking ID"] },
  { id: "WEB#6001021", name: "lux-goods-factory.co", risk: 69, type: "website", geo: "BD", thumbnail: "LG", sharedSignals: ["Identical product image set"] },
  { id: "WEB#6001022", name: "discount-luxe-bags.shop", risk: 67, type: "website", geo: "PK", thumbnail: "DL", sharedSignals: ["Same nameserver cluster"] },
  { id: "WEB#6001023", name: "premium-bags-outlet.com", risk: 66, type: "website", geo: "NG", thumbnail: "PB", sharedSignals: ["Shared favicon fingerprint", "Identical Cloudflare zone config"] },
  { id: "WEB#6001024", name: "authentic-deals-hub.net", risk: 64, type: "website", geo: "EG", thumbnail: "AD", sharedSignals: ["SSL cert fingerprint matches parent"] },
  { id: "WEB#6001025", name: "replica-fashion-store.co", risk: 63, type: "website", geo: "SA", thumbnail: "RF", sharedSignals: ["Overlapping product catalog (38% match)"] },
  { id: "WEB#6001026", name: "cheap-designer-finds.com", risk: 61, type: "website", geo: "MX", thumbnail: "CD", sharedSignals: ["Same Cloudflare SSL certificate", "Same IP subnet (104.21.x.x)"] },
  { id: "WEB#6001027", name: "luxury-outlet-asia.shop", risk: 60, type: "website", geo: "TW", thumbnail: "LA", sharedSignals: ["Identical DOM structure hash"] },
  { id: "WEB#6001028", name: "brand-deals-online.net", risk: 58, type: "website", geo: "AR", thumbnail: "BD", sharedSignals: ["Same Google Analytics tracking ID"] },
  { id: "WEB#6001029", name: "elite-replica-goods.com", risk: 57, type: "website", geo: "CL", thumbnail: "ER", sharedSignals: ["Same payment gateway merchant ID", "Overlapping WHOIS registrant org"] },
  { id: "WEB#6001030", name: "fashion-bargain-hub.co", risk: 55, type: "website", geo: "CO", thumbnail: "FB", sharedSignals: ["Same nameserver cluster"] },
  { id: "WEB#6001031", name: "designergoods-direct.shop", risk: 54, type: "website", geo: "PE", thumbnail: "DG", sharedSignals: ["Partial product catalog overlap (29% match)"] },
  { id: "WEB#6001032", name: "luxe-market-deals.com", risk: 52, type: "website", geo: "ZA", thumbnail: "LM", sharedSignals: ["Shared favicon fingerprint"] },
  { id: "WEB#6001033", name: "bags-wholesale-cn.net", risk: 51, type: "website", geo: "CN", thumbnail: "BW", sharedSignals: ["Identical Cloudflare zone config", "Same IP subnet (104.21.x.x)"] },
  { id: "WEB#6001034", name: "outlet-fashion-hub.co", risk: 49, type: "website", geo: "KE", thumbnail: "OF", sharedSignals: ["SSL cert fingerprint matches parent"] },
  { id: "WEB#6001035", name: "replica-goods-market.shop", risk: 48, type: "website", geo: "GH", thumbnail: "RG", sharedSignals: ["Same Google Analytics tracking ID"] },
  { id: "WEB#6001036", name: "premium-fashion-finds.com", risk: 46, type: "website", geo: "MA", thumbnail: "PF", sharedSignals: ["Overlapping WHOIS registrant org"] },
  { id: "WEB#6001037", name: "cheap-luxury-emporium.net", risk: 44, type: "website", geo: "TN", thumbnail: "CL", sharedSignals: ["Same nameserver cluster", "Identical TOS page content hash"] },
  { id: "WEB#6001038", name: "auth-fashion-store.co", risk: 42, type: "website", geo: "LK", thumbnail: "AF", sharedSignals: ["Same payment gateway merchant ID"] },
  { id: "WEB#6001039", name: "designer-vault-online.com", risk: 40, type: "website", geo: "MM", thumbnail: "DV", sharedSignals: ["Partial product catalog overlap (22% match)"] },
  { id: "WEB#6001040", name: "lux-finds-global.shop", risk: 38, type: "website", geo: "NP", thumbnail: "LF", sharedSignals: ["Shared Cloudflare SSL certificate"] },
  { id: "WEB#6001041", name: "branded-outlet-deals.net", risk: 36, type: "website", geo: "KH", thumbnail: "BO", sharedSignals: ["Same IP subnet (104.21.x.x)"] },
  { id: "WEB#6001042", name: "fashion-finds-direct.com", risk: 34, type: "website", geo: "LA", thumbnail: "FF", sharedSignals: ["Identical DOM structure hash"] },
  { id: "WEB#6001043", name: "luxe-bargains-asia.co", risk: 32, type: "website", geo: "BN", thumbnail: "LB", sharedSignals: ["Same Google Analytics tracking ID", "Overlapping WHOIS registrant org"] },
  { id: "WEB#6001044", name: "replica-deals-hub.shop", risk: 30, type: "website", geo: "FJ", thumbnail: "RD", sharedSignals: ["Same nameserver cluster"] },
  { id: "WEB#6001045", name: "outlet-goods-intl.net", risk: 28, type: "website", geo: "MV", thumbnail: "OG", sharedSignals: ["Partial product catalog overlap (18% match)"] },
  // ─── Additional images ───
  { id: "IMG#8823", name: "product_detail_03.jpg", risk: 70, type: "image", geo: "—", thumbnail: "IM", sharedSignals: ["pHash near-duplicate of parent listing detail", "EXIF metadata stripped"] },
  { id: "IMG#8824", name: "lifestyle_shot_01.jpg", risk: 62, type: "image", geo: "—", thumbnail: "IM", sharedSignals: ["Background scene reused across 4 counterfeit domains"] },
  { id: "IMG#8825", name: "size_chart_fake.png", risk: 55, type: "image", geo: "—", thumbnail: "IM", sharedSignals: ["OCR text differs from official sizing guide", "Font mismatch detected"] },
  { id: "IMG#8826", name: "hero_banner_02.jpg", risk: 48, type: "image", geo: "—", thumbnail: "IM", sharedSignals: ["Color-shifted variant of parent hero image"] },
  // ─── Additional posts ───
  { id: "POST#44301", name: "TikTok @luxefinds — Video", risk: 71, type: "post", geo: "US", thumbnail: "PO", sharedSignals: ["Bio link points to WEB#6001003", "Product shown matches counterfeit catalog"] },
  { id: "POST#44302", name: "Pinterest Pin — Board #882", risk: 58, type: "post", geo: "UK", thumbnail: "PO", sharedSignals: ["Pin redirects to WEB#6001010 via affiliate link"] },
  { id: "POST#44303", name: "X @deals_luxury — Thread", risk: 44, type: "post", geo: "NG", thumbnail: "PO", sharedSignals: ["Account created same week as WEB#6001023"] },
];

const MOCK_TOP_RULES = [
  {
    id: "rule_99",
    name: "Auto-Reject: Known Scam Signature",
    matchPercentage: 100,
    targetLabel: "Counterfeit",
    conditions: [
      { name: "Image hash matches known scam DB", passed: true },
      { name: "Price variance > 80%", passed: true },
      { name: "Domain flagged in threat intel feed", passed: true },
    ],
  },
  {
    id: "rule_88",
    name: "Auto-Reject: Counterfeit Image + Low Price",
    matchPercentage: 98,
    conditions: [
      { name: "Image recognized as Counterfeit", passed: true },
      { name: "Brand matches premium list", passed: true },
      { name: "Price is below 20% of retail", passed: false },
    ],
  },
  {
    id: "rule_34",
    name: "Auto-Flag: Luxury Keyword Density",
    matchPercentage: 91,
    conditions: [
      { name: "Page contains > 5 luxury brand names", passed: true },
      { name: "Keyword density exceeds 8% threshold", passed: true },
      { name: "No official retailer certificate found", passed: true },
      { name: "Domain registered to brand-authorized entity", passed: false },
    ],
  },
  {
    id: "rule_56",
    name: "Auto-Reject: Cloned Site Template",
    matchPercentage: 85,
    conditions: [
      { name: "DOM structure matches known clone template", passed: true },
      { name: "Favicon fingerprint matches flagged set", passed: true },
      { name: "SSL certificate issued within 7 days", passed: false },
      { name: "Hosting provider on watchlist", passed: true },
    ],
  },
  {
    id: "rule_12",
    name: "Auto-Reject: High-Risk Geo + New Domain",
    matchPercentage: 75,
    conditions: [
      { name: "Registrar matches flagged list", passed: true },
      { name: "Domain age < 30 days", passed: false },
      { name: "Geo matches High-Risk regions", passed: false },
    ],
  },
  {
    id: "rule_71",
    name: "Auto-Flag: Suspicious Payment Flow",
    matchPercentage: 68,
    conditions: [
      { name: "Checkout redirects to external domain", passed: true },
      { name: "Payment processor not PCI-DSS compliant", passed: false },
      { name: "No refund policy page detected", passed: false },
      { name: "Contact page missing or incomplete", passed: true },
    ],
  },
  {
    id: "rule_45",
    name: "Auto-Flag: Social Proof Manipulation",
    matchPercentage: 62,
    conditions: [
      { name: "Fake review pattern detected", passed: true },
      { name: "Social media links redirect to unrelated pages", passed: false },
      { name: "Trust badge images are stock/generic", passed: true },
      { name: "Testimonial names match known fake corpus", passed: false },
    ],
  },
  {
    id: "rule_63",
    name: "Auto-Reject: DMCA Repeat Offender",
    matchPercentage: 55,
    conditions: [
      { name: "Domain owner has prior DMCA strikes", passed: true },
      { name: "Content matches takedown request archive", passed: false },
      { name: "Hosting mirrors previously removed site", passed: false },
    ],
  },
];

const MOCK_COMMENTS = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "SC",
    time: "2h ago",
    text: "Checked the WHOIS — domain was registered through a privacy proxy. The registrant org matches a known network of counterfeit luxury goods sites we flagged last quarter.",
  },
  {
    id: 2,
    author: "uyuusaf",
    avatar: "UY",
    time: "1h ago",
    text: "Confirmed. Cross-referenced with the image cluster from WEB#3044171 — same product photography, different watermarks. Validated as counterfeit.",
  },
  {
    id: 3,
    author: "System",
    avatar: "AI",
    time: "45m ago",
    text: "Auto-linked 3 related domains sharing identical Cloudflare configuration and SSL certificate fingerprint.",
  },
];

/* ─── Local Sub-Components ─── */

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="size-3.5 text-neutral-400" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">
        {label}
      </span>
    </div>
  );
}

function DataPoint({
  label,
  value,
  isLink = false,
  risk,
}: {
  label: string;
  value: string;
  isLink?: boolean;
  risk?: RiskLevel;
}) {
  const valueClass = risk
    ? `text-[12px] ${RISK_VALUE_STYLES[risk]}`
    : "text-[12px] font-medium text-neutral-900";

  return (
    <div>
      <div className="text-[10px] text-neutral-500 mb-1">{label}</div>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-medium text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <div className={valueClass}>{value}</div>
      )}
    </div>
  );
}

function EditableField({
  label,
  defaultValue,
  type = "input",
  options,
}: {
  label: string;
  defaultValue: string;
  type?: "input" | "select";
  options?: string[];
}) {
  return (
    <div>
      <div className="text-[10px] text-neutral-500 mb-1">{label}</div>
      {type === "select" && options ? (
        <Select defaultValue={defaultValue}>
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input className="h-8 text-xs" defaultValue={defaultValue} />
      )}
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  iconColor,
  action,
  detail,
  time,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  action: string;
  detail?: string;
  time: string;
}) {
  return (
    <div className="flex gap-3 mb-4 relative">
      <div className="size-6 rounded-full bg-white border border-neutral-200 flex items-center justify-center z-10 shrink-0">
        <Icon className={`size-3 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-medium text-neutral-900">
            {action}
          </span>
          <span className="text-[10px] text-neutral-500 whitespace-nowrap">
            {time}
          </span>
        </div>
        {detail && (
          <span className="text-[11px] text-neutral-500">{detail}</span>
        )}
      </div>
    </div>
  );
}

function TimelineGroup({
  date,
  items,
}: {
  date: string;
  items: {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    action: string;
    detail?: string;
    time: string;
  }[];
}) {
  return (
    <>
      <div className="text-xs font-bold text-neutral-900 mt-6 first:mt-0 mb-4">
        {date}
      </div>
      <div className="relative pl-0">
        <div className="absolute left-[11px] top-3 bottom-0 border-l border-neutral-200" />
        {items.map((item, i) => (
          <TimelineItem key={i} {...item} />
        ))}
      </div>
    </>
  );
}

/* ─── Memoized Target Preview (never re-renders on tab/store changes) ─── */

const TargetPreview = memo(
  ({ url, displayUrl }: { url: string; displayUrl: string }) => (
    <div className="flex flex-col h-full bg-white">
      <div className="h-10 bg-neutral-100 border-b border-neutral-200 flex items-center px-3 gap-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-neutral-300" />
          <span className="size-3 rounded-full bg-neutral-300" />
          <span className="size-3 rounded-full bg-neutral-300" />
        </div>
        <div className="flex-1 max-w-md h-6 bg-white rounded flex items-center px-2 text-[11px] text-neutral-500 border border-neutral-200 gap-1.5">
          <RiLockLine className="size-3 text-neutral-400 shrink-0" />
          <span className="truncate">{displayUrl}</span>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden w-full min-h-0">
        <iframe
          src={url}
          className="absolute inset-0 w-full h-full border-0"
          title="Website Preview"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          loading="lazy"
        />
      </div>
    </div>
  )
);
TargetPreview.displayName = "TargetPreview";

/* ─── Entity Deep Dive (rich split-pane preview) ─── */

function EntityDeepDive({ entityId }: { entityId: string }) {
  const entity = NETWORK_ENTITIES.find((e) => e.id === entityId);
  const setSelectedPreview = useNetworkStore((s) => s.setSelectedPreview);

  if (!entity) return null;

  const riskBadgeClass =
    entity.risk >= 80
      ? "text-red-600 border-red-200 bg-red-50"
      : entity.risk >= 50
        ? "text-orange-600 border-orange-200 bg-orange-50"
        : "text-emerald-600 border-emerald-200 bg-emerald-50";

  const previewLabel =
    entity.type === "website"
      ? "Page Preview"
      : entity.type === "image"
        ? "Image Preview"
        : "Post Preview";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <RiExternalLinkLine className="size-4 text-neutral-500 shrink-0" />
          <h2 className="text-sm font-bold text-neutral-900 truncate">
            {entity.id}
          </h2>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 shrink-0 ${riskBadgeClass}`}
          >
            Risk {entity.risk}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0"
          onClick={() => setSelectedPreview(null)}
        >
          <RiCloseLine className="size-4" />
        </Button>
      </div>

      {/* Scrollable body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 space-y-8">
          {/* Entity Identity */}
          <section className="space-y-4">
            <SectionHeader icon={RiGlobalLine} label="Entity Identity" />
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-500">Name</span>
                <p className="text-sm font-medium text-neutral-900">
                  {entity.name}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-500">Type</span>
                <p className="text-sm font-medium text-neutral-900 uppercase">
                  {entity.type}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-500">Geo</span>
                <p className="text-sm font-medium text-neutral-900">
                  {entity.geo}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-500">Risk Score</span>
                <p className="text-sm font-medium text-neutral-900">
                  {entity.risk}/100
                </p>
              </div>
            </div>
          </section>

          {/* Shared Signals */}
          <section className="space-y-4">
            <SectionHeader icon={RiShieldCheckLine} label="Shared Signals" />
            <div className="space-y-2.5">
              {entity.sharedSignals.map((signal) => (
                <div
                  key={signal}
                  className="flex items-start gap-2"
                >
                  <RiCheckLine className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">{signal}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Preview */}
          <section className="space-y-4">
            <SectionHeader icon={RiExternalLinkLine} label={previewLabel} />
            <div className="border border-neutral-200 rounded-md bg-neutral-50 h-48 flex items-center justify-center text-xs text-neutral-400">
              [{entity.type.toUpperCase()}: {entity.name}]
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

/* ─── 50/50 Split-Pane Main Stage ─── */

function MainStage() {
  const selectedPreview = useNetworkStore((s) => s.selectedEntityPreview);

  if (!selectedPreview) {
    return (
      <TargetPreview
        url="https://www.wikipedia.org"
        displayUrl="https://www.tinkerlust.com/products/luxury-handbags"
      />
    );
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize={50} minSize={30}>
        <TargetPreview
          url="https://www.wikipedia.org"
          displayUrl="https://www.tinkerlust.com/products/luxury-handbags"
        />
      </ResizablePanel>
      <ResizableHandle withHandle className="bg-neutral-200" />
      <ResizablePanel defaultSize={50} minSize={30}>
        <EntityDeepDive entityId={selectedPreview} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

/* ─── Build NetworkTab Data ─── */

function buildWebsiteNetwork(): {
  summary: string;
  directClones: NetworkTabEntity[];
  suspiciousLinks: NetworkTabEntity[];
  relatedEntities: NetworkTabEntity[];
  totalRelated: number;
} {
  const toTabKind = (
    t: NetworkEntity["type"]
  ): NetworkTabEntity["kind"] =>
    t === "website" ? "website" : t === "image" ? "image" : "post";

  const all: NetworkTabEntity[] = NETWORK_ENTITIES.map((e) => ({
    id: e.id,
    kind: toTabKind(e.type),
    name: e.name,
    subtitle: e.sharedSignals[0] ?? e.geo,
    riskScore: e.risk,
    href: "#",
  }));

  const sortedByRisk = [...all].sort((a, b) => b.riskScore - a.riskScore);
  const directClones = sortedByRisk.filter((e) => e.riskScore >= 85).slice(0, 3);
  const suspiciousLinks = sortedByRisk
    .filter((e) => e.riskScore >= 50 && e.riskScore < 85)
    .slice(0, 5);

  const highCount = all.filter((e) => e.riskScore >= 80).length;
  const summary = `${highCount} high-confidence matches across ${all.length} linked entities — propagate action to shut down the cluster.`;

  return {
    summary,
    directClones,
    suspiciousLinks,
    relatedEntities: all,
    totalRelated: all.length,
  };
}

/* ─── Main Page ─── */

export function WebsiteModerationView() {
  const [sidebarTab, setSidebarTab] = useState("overview");
  const [descLang, setDescLang] = useState<"en" | "vo">("en");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [visibleRulesCount, setVisibleRulesCount] = useState(5);
  const [commentDraft, setCommentDraft] = useState("");
  const [insightPrefs, setInsightPrefs] = useState<Record<InsightPrefKey, boolean>>(DEFAULT_INSIGHT_PREFS);

  // Filter tiles by user prefs and build field risk map
  const activeTiles = useMemo(
    () => WEBSITE_RISK_TILES.filter((t) => insightPrefs[t.key as InsightPrefKey] !== false),
    [insightPrefs]
  );
  const fieldRisks = useMemo(() => buildFieldRisks(activeTiles), [activeTiles]);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* ── Top Header ── */}
      <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0 gap-2">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0 shrink">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="size-2 bg-green-500 rounded-full" />
            <span className="text-[11px] text-neutral-500">Online</span>
          </div>
          <span className="text-lg font-bold text-neutral-900 truncate">WEB#81</span>
          <span className="text-[11px] text-neutral-400 shrink-0">
            16 Apr 2021, 19:16
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-help hover:text-neutral-800 transition-colors group mr-1">
                <div className="flex items-center gap-1 underline decoration-dashed decoration-neutral-300 underline-offset-4 group-hover:decoration-neutral-400 transition-colors">
                  <RiInformationLine className="size-3 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                  <span className="hidden xl:inline">Validated by uyuusaf!</span>
                </div>
                <div className="flex">
                  <RiCheckLine className="size-3.5 text-emerald-500 -mr-1" />
                  <RiCheckLine className="size-3.5 text-emerald-500" />
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-80 p-0 shadow-lg">
              <div className="flex flex-col">
                <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50 rounded-t-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Validation History
                  </span>
                </div>
                <div className="p-2">
                  {VALIDATION_HISTORY.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-2 hover:bg-neutral-50 rounded-md transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                          {item.type === "auto" && (
                            <RiRobot2Line className="size-3.5 text-blue-500" />
                          )}
                          {item.action} by {item.actor}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {item.timestamp}
                        </span>
                        {item.type === "auto" && item.ruleName && (
                          <span className="text-[10px] font-medium text-blue-600 mt-0.5 bg-blue-50 w-fit px-1.5 py-0.5 rounded">
                            {item.ruleName}
                          </span>
                        )}
                      </div>
                      <div className="flex text-emerald-500">
                        {Array.from({ length: item.checks }).map((_, i) => (
                          <RiCheckLine
                            key={i}
                            className={`size-3.5 ${i > 0 ? "-ml-1.5" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          {/* Comments Sheet Trigger */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() => setCommentsOpen(true)}
          >
            <RiMessage3Line className="size-3.5" />
            <span className="hidden xl:inline">Comments</span>
            <Badge
              variant="secondary"
              className="text-[9px] px-1 py-0 bg-neutral-200"
            >
              {MOCK_COMMENTS.length}
            </Badge>
          </Button>

          {/* Rules Sheet Trigger */}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs text-neutral-600"
            onClick={() => setRulesOpen(true)}
          >
            <RiNodeTree className="size-3.5" />
            <span className="hidden xl:inline">Rules</span>
          </Button>

          {/* Assessment Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <RiCheckboxMultipleLine className="size-3.5" />
                <span className="hidden xl:inline">Assessment</span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[9px] bg-orange-100 text-orange-700">0</Badge>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[450px] flex flex-col p-0 bg-white">
              <SheetHeader className="px-6 py-4 border-b border-neutral-100 shrink-0">
                <SheetTitle className="text-base">Assessment Reasons</SheetTitle>
              </SheetHeader>
              <div className="flex-1 flex flex-col min-h-0">
                <Tabs defaultValue="all" className="flex-1 flex flex-col w-full">
                  <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-100 bg-neutral-50/50 shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">Flag Reasons</h3>
                    <TabsList className="h-7 bg-neutral-200/80 p-0.5">
                      <TabsTrigger value="selected" className="text-[10px] px-2.5 h-6">Selected (0)</TabsTrigger>
                      <TabsTrigger value="all" className="text-[10px] px-2.5 h-6">All</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="all" className="flex-1 flex flex-col p-0 m-0 min-h-0">
                    <div className="p-4 border-b border-neutral-100 shrink-0">
                      <div className="relative">
                        <RiSearchLine className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                        <Input placeholder="Search reasons..." className="h-9 pl-9 text-xs bg-neutral-50 border-neutral-200" />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                          <Label htmlFor="w-r-1" className="text-sm font-medium text-neutral-700 cursor-pointer">Post has obfuscated brand name</Label>
                          <Switch id="w-r-1" />
                        </div>
                        <div className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                          <Label htmlFor="w-r-2" className="text-sm font-medium text-neutral-700 cursor-pointer">Is products for sale?</Label>
                          <Switch id="w-r-2" />
                        </div>
                        <div className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                          <Label htmlFor="w-r-3" className="text-sm font-medium text-neutral-700 cursor-pointer">Is product new?</Label>
                          <Switch id="w-r-3" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2.5 py-1 mt-2">Brand Specific</h4>
                        <div className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                          <div className="flex flex-col gap-1 pr-4">
                            <Label htmlFor="w-r-4" className="text-sm font-medium text-neutral-700 cursor-pointer">No suspicious/counterfeit elements</Label>
                            <span className="text-[10px] text-neutral-400 font-mono leading-none">Product_Information &gt; all &gt; all &gt; Bio</span>
                          </div>
                          <Switch id="w-r-4" />
                        </div>
                        <div className="flex items-center justify-between p-2.5 hover:bg-neutral-50 rounded-lg transition-colors">
                          <div className="flex flex-col gap-1 pr-4">
                            <Label htmlFor="w-r-5" className="text-sm font-medium text-neutral-700 cursor-pointer">Obvious Counterfeit Keyword</Label>
                            <span className="text-[10px] text-neutral-400 font-mono leading-none">Product_Information &gt; all &gt; all &gt; Bio</span>
                          </div>
                          <Switch id="w-r-5" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="selected" className="flex-1 overflow-y-auto p-4 m-0">
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
                      <RiCheckDoubleLine className="size-8 mb-2 opacity-40" />
                      <span className="text-xs">No reasons selected yet</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </SheetContent>
          </Sheet>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs px-3 rounded-md gap-1">
                Counterfeit
                <RiArrowDownSLine className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs">
                Counterfeit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                Suspicious
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                Legitimate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-neutral-900 hover:bg-neutral-800 text-white h-8 text-xs px-4 rounded-md">
            Enforce
          </Button>

          <Button variant="ghost" size="icon" className="size-8 p-0">
            <RiMoreLine className="size-4 text-neutral-500" />
          </Button>
        </div>
      </header>

      {/* ── QUICK CONTEXT RISK BAR ── */}
      {activeTiles.length > 0 && (
        <div className="flex items-center gap-3 px-6 py-2.5 border-b border-neutral-200 bg-neutral-50 shrink-0 overflow-x-auto custom-scrollbar">
          {activeTiles.map((tile, i) => {
            const s = RISK_TILE_STYLES[tile.level];
            return (
              <div key={i} className={`shrink-0 flex flex-col px-3 py-2 rounded-md border ${s.bg} ${s.border}`}>
                <div className="flex items-center gap-1.5">
                  <tile.icon className={`w-3 h-3 ${s.icon}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${s.label}`}>
                    {tile.label}
                  </span>
                </div>
                <span className={`text-xs font-medium mt-0.5 ${s.desc}`}>
                  {tile.desc}
                </span>
              </div>
            );
          })}

          {/* Prioritize / Customize Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="shrink-0 h-full min-h-[48px] border border-dashed border-neutral-300 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 rounded-md px-3 flex flex-col gap-0.5 items-center justify-center transition-colors"
              >
                <RiSettings3Line className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold uppercase">Prioritize</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-neutral-900">Prioritize Risk Signals</DialogTitle>
                <DialogDescription className="text-sm text-neutral-500">
                  Select which risk signals are most critical for your current review.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {INSIGHT_SIGNALS.map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5 pr-4">
                      <span className="text-sm font-semibold text-neutral-900">{signal.label}</span>
                      <span className="text-xs text-neutral-500">{signal.desc}</span>
                    </div>
                    <Switch
                      checked={insightPrefs[signal.id]}
                      onCheckedChange={(checked) =>
                        setInsightPrefs((prev) => ({ ...prev, [signal.id]: checked }))
                      }
                      className="data-[state=checked]:bg-neutral-900"
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ── Comments Sheet ── */}
      <Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
        <SheetContent className="w-[440px] sm:w-[540px] flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b border-neutral-200 shrink-0">
            <SheetTitle className="text-sm font-semibold">Comments</SheetTitle>
            <SheetDescription className="text-xs text-neutral-500">
              Collaboration thread for WEB#81
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-6 py-4 space-y-5">
              {MOCK_COMMENTS.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="size-7 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600 shrink-0">
                    {comment.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-neutral-900">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {comment.time}
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-neutral-700 mt-1">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="px-6 py-4 border-t border-neutral-200 shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                className="flex-1 h-9 text-xs"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
              />
              <Button size="sm" className="h-9 px-3 gap-1.5">
                <RiSendPlaneLine className="size-3.5" />
                Send
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Rules Evaluation Sheet ── */}
      <Sheet open={rulesOpen} onOpenChange={setRulesOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto bg-white p-0">
          <SheetHeader className="px-6 pt-4 pb-4 border-b border-neutral-100">
            <SheetTitle className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <RiNodeTree className="size-4 text-blue-500" />
              Rules Evaluation
            </SheetTitle>
            <SheetDescription className="text-xs text-neutral-500">
              Top rules that almost matched — or matched but failed to execute.
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 pt-4 pb-6 space-y-3">
            <Accordion type="multiple" className="space-y-3">
              {MOCK_TOP_RULES.slice(0, visibleRulesCount).map((rule, index) => {
                const firstFailedCondition = rule.conditions.find(
                  (c) => !c.passed
                );
                const isSystemError = rule.matchPercentage === 100;

                return (
                  <AccordionItem
                    key={rule.id}
                    value={rule.id}
                    className="border border-neutral-200 rounded-lg bg-white shadow-sm overflow-hidden px-4 not-last:border-b-0"
                  >
                    <AccordionTrigger className="hover:no-underline py-3 gap-2 [&>svg]:mt-1">
                      <div className="flex flex-col gap-2 w-full min-w-0 pr-2">
                        <div className="flex justify-between items-start gap-4 w-full">
                          <span className="text-sm font-semibold text-neutral-900 leading-tight text-left">
                            <span className="text-neutral-400 mr-2">
                              #{index + 1}
                            </span>
                            {rule.name}
                          </span>
                          <span className="text-lg font-bold text-neutral-900 shrink-0">
                            {rule.matchPercentage}%
                          </span>
                        </div>

                        <Progress
                          value={rule.matchPercentage}
                          className={`h-1.5 ${
                            isSystemError
                              ? "bg-orange-100 [&>div]:bg-orange-500"
                              : "bg-neutral-200"
                          }`}
                        />

                        {isSystemError ? (
                          <span className="text-[11px] font-medium text-orange-600 flex items-center gap-1">
                            <RiAlertFill className="size-3" /> System execution
                            failed (100% match)
                          </span>
                        ) : firstFailedCondition ? (
                          <span className="text-[11px] text-neutral-500 line-clamp-1 text-left">
                            Failed on:{" "}
                            <span className="font-medium text-neutral-700">
                              {firstFailedCondition.name}
                            </span>
                          </span>
                        ) : null}
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-4">
                      <div className="space-y-2">
                        {rule.conditions.map((condition, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-3 p-2.5 rounded-md ${
                              condition.passed
                                ? "bg-transparent"
                                : "bg-red-50 border border-red-100"
                            }`}
                          >
                            {condition.passed ? (
                              <RiCheckLine className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <div className="bg-red-100 rounded-full p-0.5 mt-0.5 shrink-0">
                                <RiCloseLine className="size-3 text-red-600" />
                              </div>
                            )}
                            <span
                              className={`text-sm leading-tight ${
                                condition.passed
                                  ? "text-neutral-600"
                                  : "text-red-900 font-semibold"
                              }`}
                            >
                              {condition.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      {isSystemError && "targetLabel" in rule && (
                        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                          <p className="text-xs text-neutral-500">
                            This rule fully matched but failed to auto-execute.
                          </p>
                          <Button
                            size="sm"
                            className="bg-neutral-900 text-white hover:bg-neutral-800 shrink-0"
                            onClick={() =>
                              toast.success(
                                `Label '${rule.targetLabel}' applied. Linear ticket created for engineering.`
                              )
                            }
                          >
                            Force Apply
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {MOCK_TOP_RULES.length > visibleRulesCount && (
              <Button
                variant="ghost"
                className="w-full text-xs text-neutral-500"
                onClick={() =>
                  setVisibleRulesCount((prev) => prev + 5)
                }
              >
                Load more rules…
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Pane (Main Stage — full height, horizontal split when entity selected) ── */}
        <div className="flex-1 bg-white flex flex-col min-w-0 min-h-0 overflow-hidden h-full border-r border-neutral-200">
          <MainStage />
        </div>

        {/* ── Right Pane (Sidebar) ── */}
        <aside className="w-[380px] xl:w-[450px] shrink-0 bg-white flex flex-col min-w-0 overflow-hidden">
          <Tabs
            value={sidebarTab}
            onValueChange={setSidebarTab}
            className="flex-1 flex flex-col min-h-0 min-w-0"
          >
            {/* Tabs Header */}
            <div className="flex items-center border-b border-neutral-200 bg-white h-12 px-4 shrink-0">
              <TabsList
                variant="line"
                className="flex gap-4 xl:gap-6 bg-transparent rounded-none h-full w-auto p-0"
              >
                <TabsTrigger
                  value="overview"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiGlobalLine className="size-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiFileTextLine className="size-3.5" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiPulseLine className="size-3.5" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="network"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiNodeTree className="size-3.5" />
                  Network
                  <Badge
                    variant="secondary"
                    className="text-[9px] px-1 py-0 bg-neutral-200 ml-0.5"
                  >
                    {NETWORK_ENTITIES.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 min-h-0">
              {/* ── Overview Tab ── */}
              <TabsContent value="overview" className="p-5 space-y-6 pb-20 m-0">
                {/* Domain Intelligence */}
                <section>
                  <SectionHeader icon={RiGlobalLine} label="Domain Intelligence" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Domain Name" value="tinkerlust.com" />
                    <DataPoint label="Top Level Domain" value=".com" />
                    <DataPoint label="Category" value="Marketplace" />
                    <DataPoint label="Creation Date" value="12 Jan 2015" risk={fieldRisks["Creation Date"]} />
                    <DataPoint label="Expiry Date" value="12 Jan 2026" />
                    <DataPoint label="Registrar" value="GoDaddy LLC" risk={fieldRisks["Registrar"]} />
                    <DataPoint label="Domain Contact" value="REDACTED FOR PRIVACY" />
                    <DataPoint label="Meta Keywords" value="Prada, Gucci, cheap, replica" risk={fieldRisks["Meta Keywords"]} />
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-neutral-500">
                        Description
                      </span>
                      <div className="flex items-center bg-neutral-100 p-0.5 rounded border border-neutral-200">
                        <button
                          onClick={() => setDescLang("en")}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-sm transition-all ${
                            descLang === "en"
                              ? "bg-white shadow-sm text-neutral-900"
                              : "text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setDescLang("vo")}
                          className={`px-2 py-0.5 flex items-center justify-center rounded-sm transition-all ${
                            descLang === "vo"
                              ? "bg-white shadow-sm text-neutral-900"
                              : "text-neutral-500 hover:text-neutral-700"
                          }`}
                          title="Original Version"
                        >
                          <RiTranslate className="size-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-neutral-900 leading-relaxed bg-neutral-50 border border-neutral-100 p-3 rounded min-h-[60px]">
                      {descLang === "en"
                        ? "Tinkerlust is an Indonesian online marketplace specializing in pre-owned luxury goods, including handbags, watches, jewelry, and accessories from premium brands. The platform connects buyers and sellers of authenticated second-hand luxury items."
                        : "Tinkerlust adalah pasar online Indonesia yang mengkhususkan diri pada barang mewah bekas, termasuk tas tangan, jam tangan, perhiasan, dan aksesori dari merek premium. Platform ini menghubungkan pembeli dan penjual barang mewah bekas yang telah diautentikasi."}
                    </div>
                  </div>
                </section>

                {/* Hosting & Infrastructure */}
                <section>
                  <SectionHeader
                    icon={RiShieldCheckLine}
                    label="Hosting & Infrastructure"
                  />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Hosting Provider" value="Cloudflare, Inc." />
                    <DataPoint
                      label="Abuse Contact"
                      value="abuse@cloudflare.com"
                      isLink
                    />
                    <DataPoint label="Estimated Geo" value="Indonesia (ID)" risk={fieldRisks["Estimated Geo"]} />
                    <DataPoint
                      label="Organization"
                      value="PT Tinkerlust Digital Indonesia"
                    />
                    <DataPoint label="DNS Provider" value="Cloudflare DNS" />
                    <DataPoint
                      label="Email Infrastructure"
                      value="Google Workspace"
                    />
                  </div>
                </section>

                {/* Related Content */}
                <section>
                  <SectionHeader icon={RiFileTextLine} label="Related Content" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Related Posts" value="0" />
                    <DataPoint label="Related Images" value="0" />
                    <DataPoint label="Related Domains" value="3" />
                    <DataPoint label="Related Sellers" value="1" />
                  </div>
                </section>

                {/* Activity & Behaviour */}
                <section>
                  <SectionHeader icon={RiPulseLine} label="Activity & Behaviour" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="First Detected" value="16 Apr 2021, 19:16" />
                    <DataPoint label="Last Crawled" value="31 Mar 2026, 08:42" />
                    <DataPoint label="Risk Score" value="High (87/100)" />
                    <DataPoint label="Global Rank" value="N/A — Unranked" risk={fieldRisks["Global Rank"]} />
                  </div>
                </section>

                {/* Tags */}
                <section>
                  <SectionHeader icon={RiShieldLine} label="Tags" />
                  <div className="flex flex-wrap gap-1.5">
                    {["luxury", "marketplace", "indonesia", "handbags", "pre-owned"].map(
                      (tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] font-normal"
                        >
                          {tag}
                        </Badge>
                      )
                    )}
                    <button className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-normal text-neutral-500 border border-dashed border-neutral-300 rounded-full hover:border-neutral-400 hover:text-neutral-700 transition-colors">
                      <RiAddLine className="size-3" />
                      New Tag
                    </button>
                  </div>
                </section>

                {/* IP Assets & Documents */}
                <section>
                  <SectionHeader
                    icon={RiShieldCheckLine}
                    label="IP Assets & Documents"
                  />
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div>
                      <div className="text-[10px] text-neutral-500 mb-1">
                        IP Asset
                      </div>
                      <Select>
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue placeholder="Select asset..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tm-word" className="text-xs">
                            Trademark — Word Mark
                          </SelectItem>
                          <SelectItem value="tm-logo" className="text-xs">
                            Trademark — Logo Mark
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500 mb-1">
                        Document
                      </div>
                      <Select>
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue placeholder="Select document..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cert-1" className="text-xs">
                            US-TM-2024-0891
                          </SelectItem>
                          <SelectItem value="cert-2" className="text-xs">
                            EU-TM-2023-4412
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>
              </TabsContent>

              {/* ── Details Tab ── */}
              <TabsContent value="details" className="p-5 space-y-6 pb-20 m-0">
                <section>
                  <SectionHeader icon={RiGlobalLine} label="Domain Intelligence" />
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <EditableField label="Domain Name" defaultValue="tinkerlust.com" />
                    <EditableField
                      label="Top Level Domain"
                      defaultValue=".com"
                      type="select"
                      options={[".com", ".net", ".org", ".io", ".co"]}
                    />
                    <EditableField
                      label="Category"
                      defaultValue="Marketplace"
                      type="select"
                      options={[
                        "Marketplace",
                        "Ecommerce",
                        "Social Media",
                        "Standalone Store",
                        "Social Commerce",
                        "Auction",
                      ]}
                    />
                    <EditableField label="Creation Date" defaultValue="12 Jan 2015" />
                    <EditableField label="Expiry Date" defaultValue="12 Jan 2026" />
                    <EditableField label="Registrar" defaultValue="GoDaddy LLC" />
                    <EditableField
                      label="Domain Contact"
                      defaultValue="REDACTED FOR PRIVACY"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="text-[10px] text-neutral-500 mb-1">
                      Description
                    </div>
                    <textarea
                      defaultValue="Tinkerlust is an Indonesian online marketplace specializing in pre-owned luxury goods, including handbags, watches, jewelry, and accessories from premium brands."
                      className="w-full h-20 text-[11px] leading-relaxed text-neutral-700 border border-neutral-200 rounded p-3 bg-neutral-50 resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
                    />
                  </div>
                </section>

                <section>
                  <SectionHeader
                    icon={RiShieldCheckLine}
                    label="Hosting & Infrastructure"
                  />
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <EditableField
                      label="Hosting Provider"
                      defaultValue="Cloudflare, Inc."
                    />
                    <EditableField
                      label="Abuse Contact"
                      defaultValue="abuse@cloudflare.com"
                    />
                    <EditableField
                      label="Estimated Geo"
                      defaultValue="Indonesia (ID)"
                      type="select"
                      options={[
                        "Indonesia (ID)",
                        "United States (US)",
                        "China (CN)",
                        "United Kingdom (GB)",
                      ]}
                    />
                    <EditableField
                      label="Organization"
                      defaultValue="PT Tinkerlust Digital Indonesia"
                    />
                    <EditableField label="DNS Provider" defaultValue="Cloudflare DNS" />
                    <EditableField
                      label="Email Infrastructure"
                      defaultValue="Google Workspace"
                      type="select"
                      options={[
                        "Google Workspace",
                        "Microsoft 365",
                        "Self-hosted",
                        "Other",
                      ]}
                    />
                  </div>
                </section>

                <section>
                  <SectionHeader icon={RiPulseLine} label="Activity & Behaviour" />
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <EditableField
                      label="First Detected"
                      defaultValue="16 Apr 2021, 19:16"
                    />
                    <EditableField
                      label="Last Crawled"
                      defaultValue="31 Mar 2026, 08:42"
                    />
                    <EditableField label="Risk Score" defaultValue="87" />
                  </div>
                </section>
              </TabsContent>

              {/* ── Activity Tab ── */}
              <TabsContent value="activity" className="p-5 pb-20 m-0">
                <Select defaultValue="all">
                  <SelectTrigger className="h-8 text-xs w-[180px] mb-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Activity
                    </SelectItem>
                    <SelectItem value="validations" className="text-xs">
                      Validations
                    </SelectItem>
                    <SelectItem value="enforcement" className="text-xs">
                      Enforcement
                    </SelectItem>
                    <SelectItem value="system" className="text-xs">
                      System
                    </SelectItem>
                  </SelectContent>
                </Select>

                <TimelineGroup
                  date="31 Mar 2026"
                  items={[
                    {
                      icon: RiCheckDoubleLine,
                      iconColor: "text-green-500",
                      action: "Validated as Counterfeit",
                      detail: "by uyuusaf!",
                      time: "08:42",
                    },
                    {
                      icon: RiShieldLine,
                      iconColor: "text-red-500",
                      action: "Label set to Counterfeit",
                      detail: "Automatic classification",
                      time: "08:42",
                    },
                    {
                      icon: RiTimeLine,
                      iconColor: "text-neutral-500",
                      action: "Page crawled successfully",
                      detail: "200 OK — 1.2s response time",
                      time: "08:41",
                    },
                  ]}
                />

                <TimelineGroup
                  date="28 Mar 2026"
                  items={[
                    {
                      icon: RiShieldLine,
                      iconColor: "text-orange-500",
                      action: "Flagged as Suspicious",
                      detail: "ML confidence: 0.89",
                      time: "14:23",
                    },
                    {
                      icon: RiTimeLine,
                      iconColor: "text-neutral-500",
                      action: "Page crawled successfully",
                      detail: "200 OK — 0.8s response time",
                      time: "14:22",
                    },
                  ]}
                />

                <TimelineGroup
                  date="16 Apr 2021"
                  items={[
                    {
                      icon: RiGlobalLine,
                      iconColor: "text-blue-500",
                      action: "Domain first detected",
                      detail: "Added to monitoring queue",
                      time: "19:16",
                    },
                    {
                      icon: RiTimeLine,
                      iconColor: "text-neutral-500",
                      action: "Initial crawl completed",
                      detail: "200 OK — 2.1s response time",
                      time: "19:17",
                    },
                  ]}
                />
              </TabsContent>

              {/* ── Network Tab ── */}
              <TabsContent
                value="network"
                className="m-0 p-5 pb-20 outline-none focus:ring-0"
              >
                {(() => {
                  const net = buildWebsiteNetwork();
                  return (
                    <NetworkTab
                      clusterLabel="Counterfeit Cluster"
                      summary={net.summary}
                      directClones={net.directClones}
                      suspiciousLinks={net.suspiciousLinks}
                      relatedEntities={net.relatedEntities}
                      totalRelated={net.totalRelated}
                      contextLabel="WEB#81 network"
                    />
                  );
                })()}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
