"use client";

import { format, differenceInMonths } from "date-fns";
import { RiGlobalLine, RiExternalLinkLine } from "@remixicon/react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface WebsiteCellProps {
  websiteUrl: string;
  isUp: boolean;
  lastCrawledDate: string;
  storeType?: string;
  listingsCount?: number;
  country?: string;
  relatedDomains?: string[];
}

const STATUS_CONFIG = {
  Up: { color: "text-emerald-500", text: "Website is up" },
  Down: { color: "text-red-500", text: "Website is down" },
  Unknown: { color: "text-neutral-400", text: "Website status unknown" },
} as const;

export function WebsiteCell({
  websiteUrl,
  isUp,
  lastCrawledDate,
  storeType = "Independent Store",
  listingsCount = 0,
  country = "Unknown",
  relatedDomains = [],
}: WebsiteCellProps) {
  const crawlDate = new Date(lastCrawledDate);
  const monthsSinceCrawl = differenceInMonths(new Date(), crawlDate);

  const isUnknown = monthsSinceCrawl > 2;
  const finalStatus = isUnknown ? "Unknown" : isUp ? "Up" : "Down";
  const config = STATUS_CONFIG[finalStatus];
  const hasRelatedDomains = relatedDomains.length > 0;
  const storeTypeParts = storeType.split(" ");

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link
          href={`https://${websiteUrl}`}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-1.5 w-fit text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          {websiteUrl}
          <RiExternalLinkLine className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </HoverCardTrigger>

      <HoverCardContent
        className="w-[340px] p-4 bg-white shadow-lg shadow-neutral-900/5 rounded-xl border-neutral-200"
        align="start"
        sideOffset={4}
      >
        <div className="flex items-start gap-3">
          <RiGlobalLine className={`size-5 shrink-0 mt-0.5 ${config.color}`} />

          <div className="flex flex-col w-full">
            <span className="text-[15px] font-medium text-neutral-900 leading-tight mb-1">
              {config.text}
            </span>

            <span className="text-sm text-neutral-500 mb-3">
              Last crawled {format(crawlDate, "MMM dd, yyyy")}
            </span>

            <div className="flex items-center gap-4 text-sm text-neutral-500 mb-1">
              <div className="flex flex-col leading-snug min-w-[90px]">
                <span>{storeTypeParts[0]}</span>
                {storeTypeParts[1] && (
                  <span>{storeTypeParts.slice(1).join(" ")}</span>
                )}
              </div>
              <Separator orientation="vertical" className="h-7 bg-neutral-200" />
              <div className="flex flex-col leading-snug">
                <span className="font-medium text-neutral-700">{listingsCount}</span>
                <span>listings</span>
              </div>
              <Separator orientation="vertical" className="h-7 bg-neutral-200" />
              <div className="flex flex-col leading-snug">
                <span>{country}</span>
              </div>
            </div>

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
