"use client";

import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden min-w-0">
        <Topbar />
        <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
