import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { UsersTable } from "@/components/settings/users-table";

export default function SettingsPage() {
  return (
    <div className="flex h-full">
      <SettingsSidebar />
      <UsersTable />
    </div>
  );
}
