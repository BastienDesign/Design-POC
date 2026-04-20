import { PostModerationClient } from "./post-moderation-client";

export default async function PostModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  return <PostModerationClient postId={decodedId} />;
}
