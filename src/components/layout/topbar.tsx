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

export function Topbar() {
  const pathname = usePathname();
  const [activeOrg, setActiveOrg] = useState<string>(SUB_ORGANIZATIONS[0].id);

  const segments = BREADCRUMBS[pathname] ?? ["Dashboard"];
  const selectedOrg = SUB_ORGANIZATIONS.find((o) => o.id === activeOrg) ?? SUB_ORGANIZATIONS[0];

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center gap-4 border-b border-neutral-100 bg-white px-4 md:px-6">
      {/* Left: Toggle + Separator + Title/Breadcrumbs */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-neutral-400 hover:text-neutral-900 transition-colors" />

        <Separator orientation="vertical" className="h-4 bg-neutral-200" />

        {/* Dynamic Breadcrumb / Page Title */}
        {segments.length === 1 ? (
          <span className="text-[14px] font-medium text-neutral-900 tracking-tight">
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
                      <BreadcrumbSeparator className="text-neutral-400" />
                    )}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="text-[14px] font-medium text-neutral-900 tracking-tight">
                          {segment}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href="#" className="text-[14px] text-neutral-500 hover:text-neutral-900 transition-colors">
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
              className="h-8 gap-2 border-neutral-200 px-3 text-[13px] font-medium text-neutral-700 shadow-sm"
            >
              <RiBuildingLine size={14} className="text-neutral-400" />
              {selectedOrg.name}
              <RiArrowDownSLine size={14} className="text-neutral-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            {SUB_ORGANIZATIONS.map((org) => (
              <DropdownMenuItem
                key={org.id}
                className="flex cursor-pointer items-center justify-between text-[13px]"
                onSelect={() => setActiveOrg(org.id)}
              >
                <span className={org.id === activeOrg ? "font-medium text-neutral-900" : ""}>
                  {org.name}
                </span>
                {org.count !== null && (
                  <span className="tabular-nums text-neutral-400">
                    {org.count.toLocaleString()}
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
