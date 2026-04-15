import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { AutoModerationEngine } from "./auto-moderation-engine";

export default function AutoModerationPage() {
  return (
    <div className="flex h-full">
      <SettingsSidebar />
      <AutoModerationEngine />
    </div>
  );
}
