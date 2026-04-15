import { AccountModerationClient } from "./account-moderation-client";

export function generateStaticParams() {
  return [
    { id: "ACC-01" },
    { id: "ACC-02" },
    { id: "ACC-03" },
    { id: "ACC-04" },
    { id: "ACC-05" },
    { id: "ACC-06" },
    { id: "ACC-07" },
    { id: "ACC-08" },
  ];
}

export default async function AccountModerationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  return <AccountModerationClient accountId={decodedId} />;
}
