"use client";

import {
  RiLogoutBoxRLine,
  RiNotification3Line,
  RiSettings4Line,
  RiArrowUpSLine,
} from "@remixicon/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CURRENT_USER } from "@/lib/mock-data";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-neutral-100">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-neutral-100 text-xs font-semibold text-neutral-600">
              {CURRENT_USER.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-neutral-900">
              {CURRENT_USER.name}
            </p>
          </div>
          <RiArrowUpSLine className="shrink-0 text-neutral-400" size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="mb-2 w-56">
        <DropdownMenuItem className="gap-2">
          <RiNotification3Line size={16} className="text-neutral-400" />
          Notifications
          <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2">
          <RiSettings4Line size={16} className="text-neutral-400" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600">
          <RiLogoutBoxRLine size={16} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
