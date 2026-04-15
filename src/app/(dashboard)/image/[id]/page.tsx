import { EXPLORE_IMAGES } from "@/lib/mock-data";
import { ImageModerationClient } from "./image-moderation-client";

export function generateStaticParams() {
  // Include our custom mock IDs plus all derived image IDs from explore
  const customIds = ["img-1", "img-2", "img-3"];
  const exploreIds = EXPLORE_IMAGES.map((img) => img.id);
  const allIds = [...new Set([...customIds, ...exploreIds])];
  return allIds.map((id) => ({ id }));
}

export default async function ImageModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  return <ImageModerationClient imageId={decodedId} />;
}
