"use client";

import { format, differenceInMonths } from "date-fns";
import { RiGlobalLine, RiExternalLinkLine } from "@remixicon/react";
import { Separator } from "@/components/ui/separator";
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
  relatedDomains?: string[];
}

const STATUS_CONFIG = {
  Up: { color: "text-emerald-500", text: "Website is up" },
  Down: { color: "text-red-500", text: "Website is down" },
  Unknown: { color: "text-neutral-400", text: "Website status unknown" },
} as const;

export function WebsiteCell({
  websiteDomain,
  websiteUrl,
  websiteCategory,
  platformGeo,
  domainCount,
  status,
  lastCrawledDate,
  relatedDomains = [],
}: WebsiteCellProps) {
  const crawlDate = new Date(lastCrawledDate);
  const monthsSinceCrawl = differenceInMonths(new Date(), crawlDate);

  const isUnknown = monthsSinceCrawl > 2 || status === "unknown";
  const finalStatus = isUnknown ? "Unknown" : status === "up" ? "Up" : "Down";
  const config = STATUS_CONFIG[finalStatus];
  const hasRelatedDomains = relatedDomains.length > 0;

  const categoryParts = websiteCategory.split(" ");

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button className="group flex items-center gap-1.5 w-fit truncate text-[13px] font-medium text-blue-600 hover:text-blue-800 transition-colors focus:outline-none text-left">
          <span className="truncate">{websiteDomain}</span>
          <RiExternalLinkLine className="size-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
        </button>
      </HoverCardTrigger>

      <HoverCardContent
        className="w-auto min-w-[320px] max-w-[360px] p-4 z-[60] shadow-lg shadow-neutral-900/5"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-start gap-3">
          {/* Icon Column */}
          <RiGlobalLine className={`size-5 shrink-0 mt-0.5 ${config.color}`} />

          {/* Content Column */}
          <div className="flex flex-col w-full">
            {/* Status Title */}
            <span className="text-[15px] font-medium text-neutral-900 leading-tight mb-1">
              {config.text}
            </span>

            {/* Crawl Date */}
            <span className="text-sm text-neutral-500 mb-3">
              Last crawled {format(crawlDate, "MMM dd, yyyy")}
            </span>

            {/* Metadata 3-Column Row */}
            <div className="flex items-center gap-4 text-sm text-neutral-500 mb-1">
              <div className="flex flex-col leading-snug min-w-[90px]">
                <span>{categoryParts[0]}</span>
                {categoryParts.length > 1 && (
                  <span>{categoryParts.slice(1).join(" ")}</span>
                )}
              </div>
              <div className="w-px h-7 bg-neutral-200 shrink-0" />
              <div className="flex flex-col leading-snug">
                <span className="font-medium text-neutral-700">{domainCount}</span>
                <span>listing{domainCount !== 1 ? "s" : ""}</span>
              </div>
              <div className="w-px h-7 bg-neutral-200 shrink-0" />
              <div className="flex flex-col leading-snug">
                <span>{platformGeo}</span>
              </div>
            </div>

            {/* Related Domains Section */}
            {hasRelatedDomains && (
              <div className="flex flex-col mt-4">
                <Separator className="bg-neutral-100 mb-3" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-2">
                  Listed on {relatedDomains.length} other domain{relatedDomains.length !== 1 ? "s" : ""}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {relatedDomains.map((domain) => (
                    <span
                      key={domain}
                      className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded text-[11px] font-medium text-neutral-600"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
