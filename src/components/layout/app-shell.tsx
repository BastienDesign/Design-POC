"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { expanded } = useSidebar();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50/50">
      <Sidebar />
      <div
        className={`flex flex-1 min-w-0 flex-col transition-all duration-300 ease-in-out ${
          expanded ? "ml-[200px]" : "ml-0"
        }`}
      >
        <Topbar />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}
