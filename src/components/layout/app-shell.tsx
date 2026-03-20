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
      <SidebarInset>
        <Topbar />
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
