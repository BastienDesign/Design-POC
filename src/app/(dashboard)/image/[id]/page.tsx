import { ImageModerationClient } from "./image-moderation-client";

export default async function ImageModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  return <ImageModerationClient imageId={decodedId} />;
}
