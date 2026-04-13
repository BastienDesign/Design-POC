import { EXPLORE_POSTS } from "@/lib/mock-data";
import { PostModerationClient } from "./post-moderation-client";

export function generateStaticParams() {
  return EXPLORE_POSTS.map((post) => ({
    id: `PO#${post.postId}`,
  }));
}

export default async function PostModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  return <PostModerationClient postId={decodedId} />;
}
