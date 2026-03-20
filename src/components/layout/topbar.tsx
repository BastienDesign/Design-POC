"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  RiArrowRightSLine,
  RiLayoutLeftLine,
  RiArrowDownSLine,
  RiBuildingLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BREADCRUMBS, NAV_ITEMS, SUB_ORGANIZATIONS } from "@/lib/mock-data";
import { useSidebar } from "./sidebar-context";

export function Topbar() {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const [activeOrg, setActiveOrg] = useState<string>(SUB_ORGANIZATIONS[0].id);

  const segments = BREADCRUMBS[pathname] ?? ["Dashboard"];
  const selectedOrg = SUB_ORGANIZATIONS.find((o) => o.id === activeOrg) ?? SUB_ORGANIZATIONS[0];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
      {/* Left: Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="-ml-2 h-8 w-8 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-0"
        >
          <RiLayoutLeftLine size={18} />
        </Button>
        <nav className="flex items-center gap-1.5 text-[14px] text-neutral-500">
          {segments.map((segment, index) => (
            <span key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <RiArrowRightSLine className="text-neutral-400" size={16} />
              )}
              <span
                className={
                  index === segments.length - 1
                    ? "font-medium text-neutral-900"
                    : "cursor-pointer transition-colors hover:text-neutral-900"
                }
              >
                {segment}
              </span>
            </span>
          ))}
        </nav>
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
