import { AccountModerationClient } from "./account-moderation-client";

export default async function AccountModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  return <AccountModerationClient accountId={decodedId} />;
}
