"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiUserLine,
  RiPaletteLine,
  RiSettings3Line,
  RiGroupLine,
  RiRadarLine,
  RiShieldCheckLine,
  RiHammerLine,
  RiFileShield2Line,
  RiPriceTag3Line,
  RiRobot2Line,
  RiArrowLeftSLine,
} from "@remixicon/react";
import { SETTINGS_NAV_SECTIONS } from "@/lib/mock-data";
import type { RemixiconComponentType } from "@remixicon/react";

const ICON_MAP: Record<string, RemixiconComponentType> = {
  RiUserLine,
  RiPaletteLine,
  RiSettings3Line,
  RiGroupLine,
  RiRadarLine,
  RiShieldCheckLine,
  RiHammerLine,
  RiFileShield2Line,
  RiPriceTag3Line,
  RiRobot2Line,
};

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4">
        <Link
          href="/overview"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <RiArrowLeftSLine className="h-[18px] w-[18px]" />
        </Link>
        <h2 className="text-sm font-semibold text-foreground">Settings</h2>
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {SETTINGS_NAV_SECTIONS.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {section.section}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = ICON_MAP[item.icon];
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "border-r-2 border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
