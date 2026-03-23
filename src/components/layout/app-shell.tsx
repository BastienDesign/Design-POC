"use client";

import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="!min-h-0 h-full" style={{ "--sidebar-width": "12.5rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden min-w-0">
        <Topbar />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
