"use client";

import { ImageModerationView } from "./image-moderation-view";

export function ImageModerationClient({ imageId }: { imageId: string }) {
  return (
    <div className="flex-1 w-full min-h-0">
      <ImageModerationView imageId={imageId} />
    </div>
  );
}
