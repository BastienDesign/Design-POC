"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  RiArrowDownSLine,
  RiBuildingLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BREADCRUMBS, SUB_ORGANIZATIONS } from "@/lib/mock-data";

export function Topbar() {
  const pathname = usePathname();
  const [activeOrg, setActiveOrg] = useState<string>(SUB_ORGANIZATIONS[0].id);

  const segments = BREADCRUMBS[pathname] ?? ["Dashboard"];
  const selectedOrg = SUB_ORGANIZATIONS.find((o) => o.id === activeOrg) ?? SUB_ORGANIZATIONS[0];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
      {/* Left: Toggle + Breadcrumbs */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, index) => (
              index < segments.length - 1 ? (
                <BreadcrumbItem key={index} className="hidden md:block">
                  <BreadcrumbLink href="#">{segment}</BreadcrumbLink>
                  <BreadcrumbSeparator className="hidden md:block" />
                </BreadcrumbItem>
              ) : (
                <BreadcrumbItem key={index}>
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                </BreadcrumbItem>
              )
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Organization Selector */}
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
    </header>
  );
}
