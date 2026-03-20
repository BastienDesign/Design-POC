"use client";

import { RiExpandUpDownLine, RiCheckLine } from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ORGANIZATIONS, ACTIVE_ORG, ORG_COUNT } from "@/lib/mock-data";
import { useState } from "react";

export function OrgSwitcher() {
  const [activeOrg, setActiveOrg] = useState<(typeof ORGANIZATIONS)[number]>(ACTIVE_ORG);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-neutral-100">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
            {activeOrg.logo}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {activeOrg.name}
            </p>
            <p className="text-[11px] text-neutral-400">
              {ORG_COUNT} Organizations
            </p>
          </div>
          <RiExpandUpDownLine className="h-4 w-4 shrink-0 text-neutral-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        {ORGANIZATIONS.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => setActiveOrg(org)}
            className="flex items-center gap-3"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-neutral-100 text-[10px] font-bold text-neutral-600">
              {org.logo}
            </div>
            <span className="flex-1 truncate text-sm">{org.name}</span>
            {activeOrg.id === org.id && (
              <RiCheckLine className="h-4 w-4 text-emerald-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
