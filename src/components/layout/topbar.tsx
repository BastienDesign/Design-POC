"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  RiArrowDownSLine,
  RiBuildingLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BREADCRUMBS, SUB_ORGANIZATIONS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

export function Topbar() {
  const pathname = usePathname();
  const { subOrganizations } = useAuth();
  const subs = subOrganizations.length > 0 ? subOrganizations : SUB_ORGANIZATIONS;
  const [activeOrg, setActiveOrg] = useState<string>(subs[0]?.id ?? "");

  // Dynamic breadcrumbs for entity routes
  const SEGMENT_HREFS: Record<string, string> = {
    Explore: "/explore",
    Websites: "/explore?tab=Websites",
    Posts: "/explore?tab=Posts",
    Accounts: "/explore?tab=Accounts",
    Images: "/explore?tab=Images",
    Settings: "/settings",
  };

  let segments: string[];
  if (pathname.startsWith("/website/")) {
    const id = decodeURIComponent(pathname.split("/website/")[1] || "");
    segments = ["Explore", "Websites", id];
  } else if (pathname.startsWith("/post/")) {
    const id = decodeURIComponent(pathname.split("/post/")[1] || "");
    segments = ["Explore", "Posts", id];
  } else if (pathname.startsWith("/account/")) {
    const id = decodeURIComponent(pathname.split("/account/")[1] || "");
    segments = ["Explore", "Accounts", id];
  } else if (pathname.startsWith("/image/")) {
    const id = decodeURIComponent(pathname.split("/image/")[1] || "");
    segments = ["Explore", "Images", id];
  } else {
    segments = BREADCRUMBS[pathname] ?? [
      pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Dashboard",
    ];
  }
  const selectedOrg = subs.find((o) => o.id === activeOrg) ?? subs[0];

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center gap-4 border-b bg-background px-2">
      {/* Left: Toggle + Separator + Title/Breadcrumbs */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />

        <Separator orientation="vertical" className="!self-auto h-4" />

        {/* Dynamic Breadcrumb / Page Title */}
        {segments.length === 1 ? (
          <span className="text-[14px] font-medium text-foreground tracking-tight">
            {segments[0]}
          </span>
        ) : (
          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
              {segments.map((segment, index) => {
                const isLast = index === segments.length - 1;
                return (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <BreadcrumbSeparator className="text-muted-foreground" />
                    )}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="text-[14px] font-medium text-foreground tracking-tight">
                          {segment}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={SEGMENT_HREFS[segment] ?? "#"} className="text-[14px] text-muted-foreground hover:text-foreground transition-colors">
                          {segment}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* Right: Organization Selector */}
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-8 gap-2 px-3 text-[13px] font-medium shadow-sm"
            >
              <RiBuildingLine size={14} className="text-muted-foreground" />
              {selectedOrg.name}
              <RiArrowDownSLine size={14} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            {subs.map((org) => (
              <DropdownMenuItem
                key={org.id}
                className="flex cursor-pointer items-center justify-between text-[13px]"
                onSelect={() => setActiveOrg(org.id)}
              >
                <span className={org.id === activeOrg ? "font-medium text-foreground" : ""}>
                  {org.name}
                </span>
                {org.count !== null && (
                  <span className="tabular-nums text-muted-foreground">
                    {org.count.toLocaleString("en-US")}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
