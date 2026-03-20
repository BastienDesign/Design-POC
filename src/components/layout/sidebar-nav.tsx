"use client";

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
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

interface NavItem {
  label: string;
  href: string;
  icon: RemixiconComponentType;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/overview", icon: RiLayoutMasonryLine },
      { label: "Explore", href: "/explore", icon: RiListCheck2 },
      { label: "Cluster view", href: "/clusters", icon: RiFocus3Line },
      { label: "Ask Cortex", href: "/ask-cortex", icon: RiMagicLine },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Moderation", href: "/moderation", icon: RiAuctionLine, badge: "3" },
      { label: "Review", href: "/review", icon: RiCheckLine },
      { label: "Validation", href: "/validation", icon: RiCheckboxCircleLine },
      { label: "Enforcement", href: "/enforcement", icon: RiHammerLine },
      { label: "Labelling", href: "/labelling", icon: RiPriceTag3Line },
    ],
  },
];


function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-md px-2 py-2 text-[13px] font-medium transition-colors ${
        isActive
          ? "bg-white text-primary shadow-sm ring-1 ring-neutral-200/50"
          : "text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200"
      }`}
    >
      <Icon
        className={`h-[18px] w-[18px] shrink-0 ${
          isActive ? "text-primary" : "text-neutral-400"
        }`}
      />
      <span className="truncate">{item.label}</span>
      {item.badge && (
        <span className="ml-auto shrink-0 rounded-full bg-neutral-900 px-1.5 text-[10px] font-semibold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 flex-col">
      {/* Main groups */}
      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_GROUPS.map((group, idx) => (
          <div key={group.title}>
            <p
              className={`px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2 ${
                idx > 0 ? "mt-4" : ""
              }`}
            >
              {group.title}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname.startsWith(item.href)}
              />
            ))}
          </div>
        ))}
      </nav>

    </div>
  );
}
