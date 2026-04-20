import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId required" }, { status: 400 });
  }

  const images = await prisma.image.findMany({
    where: { parentPost: { organizationId } },
    include: {
      parentPost: {
        select: {
          id: true,
          postId: true,
          title: true,
          label: true,
          labelText: true,
          crawlingDate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = images.map((img) => ({
    id: img.imageId.toLowerCase(),
    imageId: img.imageId,
    thumbnailUrl: img.thumbnailUrl,
    parentPostId: img.parentPost.id,
    parentPostTitle: img.parentPost.title,
    postsCount: img.postsCount,
    accountsCount: img.accountsCount,
    websitesCount: img.websitesCount,
    label: img.label,
    labelText: img.labelText ?? img.label,
    firstSeen: img.firstSeen?.toISOString().split("T")[0] ?? "",
    similarity: img.similarity,
  }));

  return NextResponse.json(mapped);
}
