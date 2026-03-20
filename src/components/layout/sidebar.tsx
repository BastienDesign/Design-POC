"use client";

import { Separator } from "@/components/ui/separator";
import { OrgSwitcher } from "./org-switcher";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { useSidebar } from "./sidebar-context";

export function Sidebar() {
  const { expanded } = useSidebar();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-neutral-200/50 bg-white transition-all duration-300 ease-in-out ${
        expanded
          ? "w-[200px] opacity-100"
          : "w-0 overflow-hidden opacity-0"
      }`}
    >
      {/* Header — Org Switcher */}
      <div className="shrink-0 border-b border-neutral-100 px-2 py-2">
        <OrgSwitcher />
      </div>

      {/* Navigation */}
      <div className="flex flex-1 overflow-y-auto pt-4">
        <SidebarNav />
      </div>

      {/* Footer — User Menu */}
      <div className="shrink-0 border-t border-neutral-100 px-2 py-2">
        <UserMenu />
      </div>
    </aside>
  );
}
