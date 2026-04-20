import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId required" }, { status: 400 });
  }

  const posts = await prisma.post.findMany({
    where: { organizationId },
    include: {
      media: {
        include: { frames: true },
      },
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Map to the ExplorePost shape expected by the UI
  const mapped = posts.map((post) => {
    // Build media array matching PostMedia interface
    const media = post.media
      .filter((m) => !m.parentMediaId) // Top-level media only
      .map((m) => ({
        id: m.type === "video" ? `VID-${m.id}` : `IMG-${m.id}`,
        type: m.type as "image" | "video",
        url: m.url,
        label: m.label,
        subtitlesUrl: m.subtitlesUrl ?? undefined,
        frames: m.frames?.map((f) => ({
          id: `IMG-${f.id}`,
          type: "image" as const,
          url: f.url,
          label: f.label,
        })),
      }));

    const firstImage = media.find((m) => m.type === "image") ?? media[0];

    return {
      id: post.id,
      postId: post.postId,
      title: post.title,
      keyword: post.keyword ?? "",
      imageUrl: post.imageUrl ?? firstImage?.url ?? "",
      media,
      status: post.status,
      website: `${post.websiteDomain}/product/${post.postId}`,
      websiteDomain: post.websiteDomain,
      domainCount: post.domainCount,
      accountName: post.accountName ?? "",
      accountTag: post.accountTag ?? "",
      accountTagType: post.accountTagType ?? "unknown",
      price: post.price ?? "0,00 €",
      pricePct: post.pricePct ?? "0%",
      suspiciousCount: post.suspiciousCount,
      suspiciousReasons: post.suspiciousReasons ?? "",
      label: post.label,
      labelText: post.labelText ?? post.label,
      impactScore: post.impactScore,
      bundleItems: post.bundleItems,
      platformGeo: post.platformGeo ?? "",
      accountGeo: post.accountGeo ?? "",
      daysSinceTakedown: post.daysSinceTakedown,
      takedownDate: post.takedownDate?.toISOString().split("T")[0] ?? null,
      validationErrors: post.validationErrors ?? "",
      ipCertificate: post.ipCertificate ?? "",
      websiteCategory: post.websiteCategory ?? "",
      listedBrand: post.listedBrand ?? "",
      shipsFrom: post.shipsFrom ?? "",
      shipsTo: post.shipsTo,
      daysSinceModeration: post.daysSinceModeration,
      daysSinceNoticeSent: post.daysSinceNoticeSent,
      volumeSold: post.volumeSold,
      imageReasons: post.imageReasons ?? "",
      stock: post.stock ?? "",
      productCategory: post.productCategory ?? "",
      crawlingDate: post.crawlingDate?.toISOString().split("T")[0] ?? "",
      lastCreatedDate: post.lastCreatedDate?.toISOString().split("T")[0] ?? "",
      tags: post.tags,
      relatedDomains: post.relatedDomains,
    };
  });

  return NextResponse.json(mapped);
}
