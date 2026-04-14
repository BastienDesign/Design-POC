"use client";

import { AccountModerationView } from "./account-moderation-view";

export function AccountModerationClient({ accountId }: { accountId: string }) {
  return (
    <div className="flex-1 w-full min-h-0">
      <AccountModerationView accountId={accountId} />
    </div>
  );
}
