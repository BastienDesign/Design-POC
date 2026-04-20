/* Mock data for the Organization overview dashboard.
 * Two parallel shapes for "unique" vs "alternate" counting approaches.
 */

export type Approach = "unique" | "alternate";

export interface KpiBlock {
  infringements: number;
  enforcements: number;
  removals: number;
  compliance: number; // 0-100
  valueRemoved: number; // EUR
  trends: {
    infringements: number;
    enforcements: number;
    removals: number;
    compliance: number;
    valueRemoved: number;
  };
}

export const kpiByApproach: Record<Approach, KpiBlock> = {
  unique: {
    infringements: 3_740_186,
    enforcements: 2_932_345,
    removals: 2_056_862,
    compliance: 83,
    valueRemoved: 5_934_571,
    trends: {
      infringements: 12.4,
      enforcements: 8.1,
      removals: 15.2,
      compliance: 2.3,
      valueRemoved: 11.8,
    },
  },
  alternate: {
    infringements: 4_812_003,
    enforcements: 3_604_122,
    removals: 2_498_910,
    compliance: 79,
    valueRemoved: 6_720_002,
    trends: {
      infringements: 9.7,
      enforcements: 6.2,
      removals: 13.4,
      compliance: 1.1,
      valueRemoved: 9.4,
    },
  },
};

/* 12-month history for Infringements vs Removals (newest last) */
export const trend12mo = [
  { month: "May 25", infringements: 248_120, removals: 139_820 },
  { month: "Jun 25", infringements: 261_040, removals: 144_902 },
  { month: "Jul 25", infringements: 279_821, removals: 152_018 },
  { month: "Aug 25", infringements: 298_422, removals: 163_220 },
  { month: "Sep 25", infringements: 311_302, removals: 171_089 },
  { month: "Oct 25", infringements: 328_940, removals: 182_301 },
  { month: "Nov 25", infringements: 342_011, removals: 194_820 },
  { month: "Dec 25", infringements: 358_920, removals: 201_002 },
  { month: "Jan 26", infringements: 372_812, removals: 210_982 },
  { month: "Feb 26", infringements: 389_402, removals: 221_301 },
  { month: "Mar 26", infringements: 401_022, removals: 229_840 },
  { month: "Apr 26", infringements: 418_374, removals: 242_567 },
];

/* Time-to-Action tiles */
export const timeToAction = [
  { key: "moderate", label: "Time to Moderate", value: 5, unit: "days" as const, hint: "Detection → moderation verdict" },
  { key: "enforce", label: "Time to Enforce", value: 21, unit: "hours" as const, hint: "Verdict → takedown notice" },
  { key: "remove", label: "Time to Remove", value: 7, unit: "days" as const, hint: "Notice → platform action" },
  { key: "lifetime", label: "Removal Lifetime", value: 13, unit: "days" as const, hint: "End-to-end (detection → removal)" },
];

/* Funnel stages (absolute volumes) */
export const funnelStages = [
  { key: "detections", label: "Detections", value: 5_124_002, href: "/explore?stage=detection" },
  { key: "moderated", label: "Moderated Detections", value: 4_210_880, href: "/explore?stage=moderated" },
  { key: "actionable", label: "Actionable Infringements", value: 3_740_186, href: "/explore?stage=actionable" },
  { key: "enforcements", label: "Enforcements", value: 2_932_345, href: "/explore?stage=enforced" },
  { key: "removals", label: "Removals", value: 2_056_862, href: "/explore?stage=removed" },
];

/* Geographic breakdown — supports both seller origin & target market */
export interface CountryVolume {
  country: string;
  code: string; // ISO 3166-1 alpha-2
  enforcements: number;
  value: number; // EUR
}
export const geoBySellerOrigin: CountryVolume[] = [
  { country: "China", code: "CN", enforcements: 1_240_112, value: 2_020_420 },
  { country: "Hong Kong", code: "HK", enforcements: 412_890, value: 612_330 },
  { country: "Vietnam", code: "VN", enforcements: 298_302, value: 402_110 },
  { country: "Turkey", code: "TR", enforcements: 221_004, value: 310_880 },
  { country: "Indonesia", code: "ID", enforcements: 178_220, value: 242_108 },
  { country: "India", code: "IN", enforcements: 160_030, value: 218_008 },
  { country: "Thailand", code: "TH", enforcements: 142_003, value: 194_220 },
  { country: "Pakistan", code: "PK", enforcements: 108_210, value: 144_002 },
  { country: "United Arab Emirates", code: "AE", enforcements: 88_404, value: 141_902 },
  { country: "Russia", code: "RU", enforcements: 72_880, value: 98_220 },
];
export const geoByTargetMarket: CountryVolume[] = [
  { country: "United States", code: "US", enforcements: 892_001, value: 1_811_220 },
  { country: "Germany", code: "DE", enforcements: 512_440, value: 948_201 },
  { country: "United Kingdom", code: "GB", enforcements: 431_020, value: 780_880 },
  { country: "France", code: "FR", enforcements: 402_109, value: 742_001 },
  { country: "Japan", code: "JP", enforcements: 318_440, value: 612_330 },
  { country: "Italy", code: "IT", enforcements: 262_110, value: 498_001 },
  { country: "Canada", code: "CA", enforcements: 210_020, value: 401_220 },
  { country: "Australia", code: "AU", enforcements: 178_800, value: 352_104 },
  { country: "Spain", code: "ES", enforcements: 148_220, value: 281_004 },
  { country: "Brazil", code: "BR", enforcements: 112_005, value: 188_302 },
];

/* Top marketplaces */
export interface Marketplace {
  name: string;
  country: string;
  code: string;
  enforced: number;
  share: number; // percentage of global
  topCategory: string;
  topLabel: string;
}
export const topMarketplaces: Marketplace[] = [
  { name: "Lazada", country: "Singapore", code: "SG", enforced: 948_220, share: 32.3, topCategory: "Handbags", topLabel: "Counterfeit" },
  { name: "Shopee", country: "Singapore", code: "SG", enforced: 612_440, share: 20.9, topCategory: "Apparel", topLabel: "Counterfeit" },
  { name: "Alibaba", country: "China", code: "CN", enforced: 441_020, share: 15.0, topCategory: "Timepieces", topLabel: "Counterfeit" },
  { name: "AliExpress", country: "China", code: "CN", enforced: 318_440, share: 10.9, topCategory: "Wallets", topLabel: "Counterfeit" },
  { name: "Taobao", country: "China", code: "CN", enforced: 198_001, share: 6.8, topCategory: "Handbags", topLabel: "Counterfeit" },
  { name: "eBay", country: "United States", code: "US", enforced: 142_110, share: 4.8, topCategory: "Timepieces", topLabel: "Unauthorized Use" },
  { name: "Etsy", country: "United States", code: "US", enforced: 98_220, share: 3.3, topCategory: "Accessories", topLabel: "Trademark Misuse" },
  { name: "Mercado Libre", country: "Argentina", code: "AR", enforced: 78_303, share: 2.7, topCategory: "Apparel", topLabel: "Counterfeit" },
  { name: "Rakuten", country: "Japan", code: "JP", enforced: 52_104, share: 1.8, topCategory: "Timepieces", topLabel: "Counterfeit" },
  { name: "OZON", country: "Russia", code: "RU", enforced: 42_802, share: 1.5, topCategory: "Handbags", topLabel: "Counterfeit" },
];

/* Platform compliance (response rate %) */
export const platformCompliance = [
  { name: "Lazada", compliance: 94 },
  { name: "Shopee", compliance: 89 },
  { name: "Alibaba", compliance: 82 },
  { name: "AliExpress", compliance: 78 },
  { name: "Taobao", compliance: 71 },
  { name: "eBay", compliance: 96 },
  { name: "Etsy", compliance: 91 },
  { name: "Mercado Libre", compliance: 74 },
];

/* Repeat offenders */
export interface RepeatOffender {
  id: string;
  username: string;
  platform: string;
  country: string;
  enforcements: number;
  removals: number;
}
export const repeatOffenders: RepeatOffender[] = [
  { id: "lz-3044171", username: "lux_supply_hk", platform: "Lazada", country: "Hong Kong", enforcements: 842, removals: 612 },
  { id: "sh-2081110", username: "trend_bags_official", platform: "Shopee", country: "China", enforcements: 712, removals: 501 },
  { id: "al-1920014", username: "star_watch_cn", platform: "Alibaba", country: "China", enforcements: 604, removals: 421 },
  { id: "ax-8872001", username: "golden_vault_store", platform: "AliExpress", country: "China", enforcements: 512, removals: 388 },
  { id: "eb-4404102", username: "ny_luxury_resale", platform: "eBay", country: "United States", enforcements: 402, removals: 310 },
  { id: "tb-7712200", username: "canal_street_co", platform: "Taobao", country: "China", enforcements: 388, removals: 281 },
  { id: "et-2201004", username: "maison_artisan", platform: "Etsy", country: "Italy", enforcements: 281, removals: 212 },
];

/* Most infringing product categories */
export interface CategoryRow {
  name: string;
  enforcements: number;
  removals: number;
  stockRemoved: number;
  compliance: number; // 0-100
}
export const infringingCategories: CategoryRow[] = [
  { name: "Handbags", enforcements: 982_001, removals: 732_881, stockRemoved: 41_220, compliance: 88 },
  { name: "Wallets", enforcements: 612_440, removals: 442_091, stockRemoved: 28_110, compliance: 82 },
  { name: "Timepieces", enforcements: 441_020, removals: 288_881, stockRemoved: 12_220, compliance: 75 },
  { name: "Apparel", enforcements: 318_440, removals: 201_000, stockRemoved: 38_820, compliance: 71 },
  { name: "Accessories", enforcements: 142_110, removals: 89_220, stockRemoved: 18_220, compliance: 68 },
  { name: "Footwear", enforcements: 98_220, removals: 62_110, stockRemoved: 14_100, compliance: 64 },
];

/* Most infringed images */
export interface InfringedImage {
  id: string;
  url: string;
  postCount: number;
  marketplaceCount: number;
}
export const mostInfringedImages: InfringedImage[] = Array.from({ length: 20 }, (_, i) => ({
  id: `img-${1000 + i}`,
  url: `https://picsum.photos/seed/sentinel-infr-${i + 1}/400/400`,
  postCount: Math.round(3200 - i * 118 + ((i * 17) % 200)),
  marketplaceCount: Math.round(42 - i * 1.6 + ((i * 7) % 6)),
}));

/* Formatters */
export function formatThinSpace(n: number): string {
  // Thin space (U+2009) as thousands separator
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2009");
}
export function formatCurrencyEUR(n: number): string {
  return `€${formatThinSpace(n)}`;
}
