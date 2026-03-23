"use client";

import { format, differenceInMonths } from "date-fns";
import { RiGlobalLine, RiExternalLinkLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type WebsiteStatus = "up" | "down" | "redirected" | "unknown";

interface WebsiteCellProps {
  websiteDomain: string;
  websiteUrl: string;
  websiteCategory: string;
  platformGeo: string;
  domainCount: number;
  status: WebsiteStatus;
  lastCrawledDate: string;
}

const STATUS_CONFIG = {
  Up: { color: "text-emerald-500", text: "Website is up" },
  Down: { color: "text-red-500", text: "Website is down" },
  Unknown: { color: "text-neutral-400", text: "Status unknown" },
} as const;

export function WebsiteCell({
  websiteDomain,
  websiteUrl,
  websiteCategory,
  platformGeo,
  domainCount,
  status,
  lastCrawledDate,
}: WebsiteCellProps) {
  const crawlDate = new Date(lastCrawledDate);
  const monthsSinceCrawl = differenceInMonths(new Date(), crawlDate);

  const isUnknown = monthsSinceCrawl > 2 || status === "unknown";
  const finalStatus = isUnknown ? "Unknown" : status === "up" ? "Up" : "Down";
  const config = STATUS_CONFIG[finalStatus];

  return (
    <div className="flex items-center gap-2 w-full">
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button className="flex min-w-0 flex-1 cursor-pointer items-center gap-1 truncate text-[13px] text-blue-600 hover:text-blue-800 hover:underline focus:outline-none text-left transition-colors">
            <span className="truncate">{websiteDomain}</span>
            <RiExternalLinkLine className="h-3 w-3 shrink-0 text-blue-400" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          className="w-auto p-3 z-[60]"
          align="start"
          sideOffset={4}
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <RiGlobalLine className={`size-4 shrink-0 ${config.color}`} />
              <span className="text-sm font-medium text-neutral-900 leading-none">
                {config.text}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-6">
              <span className="text-xs text-neutral-500 leading-none">
                Last crawled {format(crawlDate, "MMM dd yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-3 pl-6 pt-1 text-xs text-neutral-500">
              <span>{websiteCategory}</span>
              <span className="h-3 w-px bg-neutral-200" />
              <span>
                {domainCount} listing{domainCount !== 1 ? "s" : ""}
              </span>
              <span className="h-3 w-px bg-neutral-200" />
              <span>{platformGeo}</span>
            </div>
            <p className="pl-6 pt-0.5 text-[11px] text-neutral-400 break-all leading-relaxed max-w-[320px]">
              {websiteUrl}
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
      {domainCount > 1 && (
        <Badge variant="secondary" className="shrink-0 px-1.5 text-[10px]">
          {domainCount}+
        </Badge>
      )}
    </div>
  );
}
