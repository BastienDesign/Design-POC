import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Deterministic seed helpers (mirror mock-data.ts logic) ──

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

// ── Seed data constants ──

const SEED_STATUSES = ["down", "up", "redirected", "unknown"] as const;
const SEED_LABELS = [
  { type: "counterfeit" as const, text: "Counterfeit" },
  { type: "suspicious" as const, text: "Suspicious" },
  { type: "legitimate" as const, text: "Legitimate" },
  { type: "unlabeled" as const, text: "Unlabeled" },
];
const SEED_TAG_TYPES = ["counterfeit", "suspicious", "legitimate", "unknown"];
const SEED_DOMAINS = ["ebay.com", "amazon.de", "shopify.com", "aliexpress.com", "ebay.co.uk", "zalando.de", "amazon.com", "etsy.com", "wish.com", "rakuten.co.jp"];
const SEED_BRANDS = ["Louis Vuitton", "Rolex", "Apple", "Nike", "Gucci", "Chanel", "Hermès", "Prada", "Dior", "Balenciaga"];
const SEED_TITLES_AND_KEYWORDS = [
  { title: "Luxury Designer Handbag — Monogram Canvas Tote Limited Edition 2025", keyword: "handbag,luxury" },
  { title: "Premium Swiss Automatic Watch — Chronograph Stainless Steel 42mm", keyword: "watch,luxury" },
  { title: "Smartphone Flagship Pro Max 512GB Unlocked — International Version", keyword: "smartphone,electronics" },
  { title: "Running Shoes Air Zoom Performance — Authentic Retailer Exclusive", keyword: "sneakers,shoes" },
  { title: "Designer Crossbody Bag Replica — High Quality PU Leather Women Shoulder", keyword: "handbag,fashion" },
  { title: "Eau de Parfum Branded Fragrance 100ml — Gift Set with Travel Spray", keyword: "perfume,fragrance" },
  { title: "Leather Belt Designer Buckle — Unisex Fashion Accessory Premium Grade", keyword: "belt,leather" },
  { title: "Wireless Earbuds Pro — Active Noise Cancellation with Charging Case", keyword: "earbuds,electronics" },
  { title: "Silk Scarf Printed Logo — Luxury Brand Multicolor Square 90x90cm", keyword: "scarf,fashion" },
  { title: "Sunglasses Aviator Classic — Polarized UV400 Gold Frame Brown Lens", keyword: "sunglasses,fashion" },
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
const SEED_RELATED_TLDS = [".ch", ".ca", ".fr", ".de", ".co.uk", ".it", ".es", ".nl", ".com.au", ".co.jp"];
const SAMPLE_VIDEOS = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
];
const MEDIA_LABELS = ["counterfeit", "suspicious", "legitimate", "unlabeled"] as const;

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.image.deleteMany();
  await prisma.media.deleteMany();
  await prisma.post.deleteMany();
  await prisma.website.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.subOrganization.deleteMany();
  await prisma.organization.deleteMany();

  // ── Organization ──
  const org = await prisma.organization.create({
    data: {
      name: "Acme Corporation",
      logo: "A",
    },
  });
  console.log(`  ✅ Organization: ${org.name}`);

  // ── Sub-Organizations ──
  const subOrgs = [
    { name: "All Organizations", count: null },
    { name: "Jordan", count: 12430 },
    { name: "Converse", count: 8712 },
    { name: "Nike ACG", count: 3215 },
    { name: "Hurley", count: 1804 },
  ];
  for (const so of subOrgs) {
    await prisma.subOrganization.create({
      data: { ...so, organizationId: org.id },
    });
  }
  console.log(`  ✅ Sub-Organizations: ${subOrgs.length}`);

  // ── Users ──
  const users = [
    { name: "Sarah Chen", subtitle: "Brand Protection Lead", email: "sarah.chen@acme.com", role: "Admin" as const, roleLabel: "Admin (Internal)", status: "active" as const, lastLogin: "2 hours ago", initials: "SC" },
    { name: "Marcus Johnson", subtitle: "IP Enforcement", email: "m.johnson@acme.com", role: "Editor" as const, roleLabel: "Editor (Internal)", status: "active" as const, lastLogin: "1 day ago", initials: "MJ" },
    { name: "Aisha Patel", subtitle: "Analytics & Reporting", email: "a.patel@acme.com", role: "Analyst" as const, roleLabel: "Analyst (Internal)", status: "active" as const, lastLogin: "3 hours ago", initials: "AP" },
    { name: "Tom Williams", subtitle: "External Legal Counsel", email: "t.williams@lawfirm.com", role: "Viewer" as const, roleLabel: "Viewer (External)", status: "active" as const, lastLogin: "5 days ago", initials: "TW" },
    { name: "Elena Rodriguez", subtitle: "Regional Manager — LATAM", email: "e.rodriguez@acme.com", role: "Editor" as const, roleLabel: "Editor (Internal)", status: "invited" as const, lastLogin: "—", initials: "ER" },
    { name: "James Kim", subtitle: "Engineering", email: "j.kim@acme.com", role: "Admin" as const, roleLabel: "Admin (Internal)", status: "active" as const, lastLogin: "12 hours ago", initials: "JK" },
  ];
  for (const u of users) {
    await prisma.user.create({
      data: { ...u, organizationId: org.id },
    });
  }
  console.log(`  ✅ Users: ${users.length}`);

  // ── Posts + Media + Images ──
  const POST_COUNT = 50;
  let mediaIdCounter = 7400100;

  for (let i = 0; i < POST_COUNT; i++) {
    const s = i * 7;
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
    const titleEntry = pick(SEED_TITLES_AND_KEYWORDS, s + 6);

    const postId = `${2168513 + i}`;
    const websiteDomain = pick(SEED_DOMAINS, s + 9);
    const crawlingDay = Math.floor(seededRandom(s + 28) * 14) + 1;
    const crawlingDate = new Date(`2026-03-${String(crawlingDay).padStart(2, "0")}`);
    const lastCreatedMonth = Math.floor(seededRandom(s + 29) * 2) + 1;
    const lastCreatedDay = Math.floor(seededRandom(s + 30) * 28) + 1;
    const lastCreatedDate = new Date(`2026-0${lastCreatedMonth}-${String(lastCreatedDay).padStart(2, "0")}`);
    const takedownDay = hasTakedown ? Math.floor(seededRandom(s + 18) * 14) + 1 : null;
    const takedownDate = takedownDay ? new Date(`2026-03-${String(takedownDay).padStart(2, "0")}`) : null;

    const tags = Array.from(
      { length: Math.floor(seededRandom(s + 31) * 5) },
      (_, j) => pick(SEED_TAGS, s + j + 32)
    ).filter((v, idx, arr) => arr.indexOf(v) === idx);

    const relatedCount = Math.floor(seededRandom(s + 33) * 5);
    const relatedDomains = relatedCount === 0 ? [] : (() => {
      const base = websiteDomain.replace(/\.[^.]+$/, "");
      return Array.from(
        { length: relatedCount },
        (_, j) => `${base}${pick(SEED_RELATED_TLDS, s + j + 34)}`
      ).filter((v, idx, arr) => arr.indexOf(v) === idx);
    })();

    // Map label type for Prisma enum
    const labelType = labelSeed.type;

    // Build first image URL
    const firstImgId = mediaIdCounter;
    const imageUrl = `https://picsum.photos/seed/${titleEntry.keyword}${firstImgId}/400/400`;

    const post = await prisma.post.create({
      data: {
        postId,
        title: titleEntry.title,
        keyword: titleEntry.keyword,
        imageUrl,
        status,
        websiteDomain,
        domainCount: Math.floor(seededRandom(s + 10) * 20) + 1,
        accountName: pick(SEED_ACCOUNTS, s + 11),
        accountTag: labelSeed.text === "Unlabeled" ? "Unknown" : labelSeed.text,
        accountTagType: tagType,
        price: `${(seededRandom(s + 12) * 1500 + 10).toFixed(2).replace(".", ",")} €`,
        pricePct: `${Math.floor(seededRandom(s + 13) * 95)}%`,
        suspiciousCount: suspCount,
        suspiciousReasons: reasons,
        label: labelType,
        labelText: labelSeed.text,
        impactScore: Math.floor(seededRandom(s + 14) * 100),
        bundleItems: Math.floor(seededRandom(s + 15) * 10) + 1,
        platformGeo: pick(SEED_GEOS, s + 16),
        accountGeo: pick(SEED_GEOS, s + 17),
        daysSinceTakedown: daysTD,
        takedownDate,
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
        crawlingDate,
        lastCreatedDate,
        tags,
        relatedDomains,
        organizationId: org.id,
      },
    });

    // ── Media for this post ──
    const mediaCount = Math.floor(seededRandom(s + 40) * 4) + 2;
    const hasVideo = i % 3 === 1;

    for (let j = 0; j < mediaCount; j++) {
      const id = mediaIdCounter++;
      const mlabelIdx = Math.floor(seededRandom(s + 40 + j * 3 + 50) * 4);

      if (hasVideo && j === 1) {
        // Video with frames
        const videoMedia = await prisma.media.create({
          data: {
            type: "video",
            url: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
            label: MEDIA_LABELS[mlabelIdx],
            subtitlesUrl: "/mock-subtitles.vtt",
            postId: post.id,
          },
        });

        const frameCount = Math.floor(seededRandom(s + 40 + 60) * 3) + 3;
        for (let fi = 0; fi < frameCount; fi++) {
          const fid = mediaIdCounter++;
          const flabelIdx = Math.floor(seededRandom(s + 40 + fi * 7 + 70) * 4);
          await prisma.media.create({
            data: {
              type: "image",
              url: `https://picsum.photos/seed/${titleEntry.keyword}${fid}/400/400`,
              label: MEDIA_LABELS[flabelIdx],
              postId: post.id,
              parentMediaId: videoMedia.id,
            },
          });

          // Create Image record for frames
          await prisma.image.create({
            data: {
              imageId: `IMG-${fid}`,
              thumbnailUrl: `https://picsum.photos/seed/${titleEntry.keyword}${fid}/400/400`,
              parentPostId: post.id,
              parentPostTitle: titleEntry.title,
              postsCount: Math.floor(seededRandom((i * 7 + fi) * 31 + 4) * 800) + 1,
              accountsCount: Math.floor(seededRandom((i * 7 + fi) * 31 + 5) * 120) + 1,
              websitesCount: Math.floor(seededRandom((i * 7 + fi) * 31 + 6) * 40) + 1,
              label: labelType as any,
              labelText: labelSeed.text,
              firstSeen: crawlingDate,
              similarity: Math.floor(seededRandom((i * 7 + fi) * 31 + 9) * 40) + 60,
            },
          });
        }
      } else {
        // Image media
        await prisma.media.create({
          data: {
            type: "image",
            url: `https://picsum.photos/seed/${titleEntry.keyword}${id}/400/400`,
            label: MEDIA_LABELS[mlabelIdx],
            postId: post.id,
          },
        });

        // Create Image record
        await prisma.image.create({
          data: {
            imageId: `IMG-${id}`,
            thumbnailUrl: `https://picsum.photos/seed/${titleEntry.keyword}${id}/400/400`,
            parentPostId: post.id,
            parentPostTitle: titleEntry.title,
            postsCount: Math.floor(seededRandom((i * 7 + j) * 31 + 4) * 800) + 1,
            accountsCount: Math.floor(seededRandom((i * 7 + j) * 31 + 5) * 120) + 1,
            websitesCount: Math.floor(seededRandom((i * 7 + j) * 31 + 6) * 40) + 1,
            label: labelType as any,
            labelText: labelSeed.text,
            firstSeen: crawlingDate,
            similarity: Math.floor(seededRandom((i * 7 + j) * 31 + 9) * 40) + 60,
          },
        });
      }
    }
  }
  console.log(`  ✅ Posts: ${POST_COUNT} (with media & images)`);

  // ── Websites ──
  const websites = [
    { domain: "tinkerlust.com", topLevelDomain: ".com", category: "Marketplace", registrar: "GoDaddy LLC", riskScore: 87, estimatedGeo: "Indonesia (ID)", hostingProvider: "Cloudflare, Inc.", tags: ["luxury", "marketplace", "indonesia", "handbags", "pre-owned"] },
    { domain: "ebay.com", topLevelDomain: ".com", category: "Marketplace", registrar: "MarkMonitor", riskScore: 12, estimatedGeo: "United States (US)", hostingProvider: "Akamai", tags: ["marketplace", "global"] },
    { domain: "amazon.de", topLevelDomain: ".de", category: "Marketplace", registrar: "MarkMonitor", riskScore: 8, estimatedGeo: "Germany (DE)", hostingProvider: "AWS", tags: ["marketplace", "europe"] },
    { domain: "aliexpress.com", topLevelDomain: ".com", category: "Marketplace", registrar: "GoDaddy LLC", riskScore: 65, estimatedGeo: "China (CN)", hostingProvider: "Alibaba Cloud", tags: ["marketplace", "china", "wholesale"] },
    { domain: "fake-shop.com", topLevelDomain: ".com", category: "Independent Store", registrar: "Namecheap", riskScore: 95, estimatedGeo: "China (CN)", hostingProvider: "Self-hosted", tags: ["counterfeit", "high-risk"] },
    { domain: "replica-hub.cn", topLevelDomain: ".cn", category: "Dropshipper", registrar: "HiChina", riskScore: 98, estimatedGeo: "China (CN)", hostingProvider: "Tencent Cloud", tags: ["replica", "counterfeit", "china"] },
  ];
  for (const w of websites) {
    await prisma.website.create({
      data: { ...w, organizationId: org.id },
    });
  }
  console.log(`  ✅ Websites: ${websites.length}`);

  // ── Accounts ──
  const accounts = SEED_ACCOUNTS.map((name, i) => ({
    accountName: name,
    accountTag: name.replace(/_/g, " "),
    tagType: SEED_TAG_TYPES[i % 4],
    platform: pick(SEED_DOMAINS, i).split(".")[0],
    geo: pick(SEED_GEOS, i),
    postsCount: Math.floor(seededRandom(i * 3) * 500) + 1,
    riskScore: Math.floor(seededRandom(i * 5) * 100),
    label: SEED_LABELS[i % 4].type,
    labelText: SEED_LABELS[i % 4].text,
  }));
  for (const a of accounts) {
    await prisma.account.create({
      data: { ...a, organizationId: org.id },
    });
  }
  console.log(`  ✅ Accounts: ${accounts.length}`);

  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
