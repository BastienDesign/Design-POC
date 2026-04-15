"use client";

import { ModerationWorkspace } from "@/components/explore/moderation-workspace";

export function PostModerationClient({ postId }: { postId: string }) {
  return (
    <div className="flex-1 w-full min-h-0">
      <ModerationWorkspace postId={postId} />
    </div>
  );
}
