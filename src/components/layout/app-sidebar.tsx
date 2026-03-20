"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiLayoutMasonryLine,
  RiListCheck2,
  RiFocus3Line,
  RiMagicLine,
  RiAuctionLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiHammerLine,
  RiPriceTag3Line,
  RiExpandUpDownLine,
  RiLogoutBoxRLine,
  RiNotification3Line,
  RiSettings4Line,
  RiArrowUpSLine,
  RiLifebuoyLine,
  RiSendPlaneLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import { ORGANIZATIONS, ACTIVE_ORG, ORG_COUNT, CURRENT_USER } from "@/lib/mock-data";
import { useState } from "react";

// ─── Navigation Data ───

interface NavItem {
  title: string;
  url: string;
  icon: RemixiconComponentType;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/overview", icon: RiLayoutMasonryLine },
      { title: "Explore", url: "/explore", icon: RiListCheck2 },
      { title: "Cluster view", url: "/clusters", icon: RiFocus3Line },
      { title: "Ask Cortex", url: "/ask-cortex", icon: RiMagicLine },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Moderation", url: "/moderation", icon: RiAuctionLine, badge: "3" },
      { title: "Review", url: "/review", icon: RiCheckLine },
      { title: "Validation", url: "/validation", icon: RiCheckboxCircleLine },
      { title: "Enforcement", url: "/enforcement", icon: RiHammerLine },
      { title: "Labelling", url: "/labelling", icon: RiPriceTag3Line },
    ],
  },
];

const NAV_SECONDARY = [
  { title: "Support", url: "#", icon: RiLifebuoyLine },
  { title: "Feedback", url: "#", icon: RiSendPlaneLine },
];

// ─── Nav Main ───

function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

// ─── Nav Secondary ───

function NavSecondary({
  items,
  ...props
}: {
  items: typeof NAV_SECONDARY;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// ─── Nav User ───

function NavUser() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-600">
                  {CURRENT_USER.initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{CURRENT_USER.name}</span>
                <span className="truncate text-xs">{CURRENT_USER.email}</span>
              </div>
              <RiArrowUpSLine className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-600">
                    {CURRENT_USER.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{CURRENT_USER.name}</span>
                  <span className="truncate text-xs">{CURRENT_USER.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <RiNotification3Line />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RiSettings4Line />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              <RiLogoutBoxRLine />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// ─── App Sidebar ───

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeOrg, setActiveOrg] = useState<(typeof ORGANIZATIONS)[number]>(ACTIVE_ORG);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                    {activeOrg.logo}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{activeOrg.name}</span>
                    <span className="truncate text-xs">{ORG_COUNT} Organizations</span>
                  </div>
                  <RiExpandUpDownLine className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                sideOffset={4}
              >
                {ORGANIZATIONS.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => setActiveOrg(org)}
                    className="flex items-center gap-3"
                  >
                    <div className="flex size-6 items-center justify-center rounded bg-neutral-100 text-[10px] font-bold text-neutral-600">
                      {org.logo}
                    </div>
                    <span className="flex-1 truncate text-sm">{org.name}</span>
                    {activeOrg.id === org.id && (
                      <RiCheckLine className="size-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={NAV_GROUPS} />
        <NavSecondary items={NAV_SECONDARY} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
