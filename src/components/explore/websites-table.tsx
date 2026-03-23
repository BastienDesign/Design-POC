"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiRobot2Line, RiArrowRightSLine } from "@remixicon/react";
import { ImageThumbnail } from "./image-thumbnail";
import { WebsiteCell } from "./website-cell";

interface WebsiteRow {
  id: string;
  status: "Online" | "Offline";
  image: string;
  url: string;
  aiInsight: boolean;
  posts: number;
  notices: number;
  label: string;
  labelColor: string;
  clusters: string;
  enforcement: string;
  lastCrawled: string;
  storeType: string;
  country: string;
  relatedDomains: string[];
}

const MOCK_WEBSITES: WebsiteRow[] = [
  {
    id: "WEB#3044171",
    status: "Online",
    image: "https://placehold.co/80x80/f5f5f5/a3a3a3?text=W",
    url: "apkmudule.com",
    aiInsight: true,
    posts: 51,
    notices: 0,
    label: "Phishing",
    labelColor: "bg-red-500",
    clusters: "-",
    enforcement: "-",
    lastCrawled: "2026-03-01T00:00:00Z",
    storeType: "Independent Store",
    country: "US",
    relatedDomains: ["apkmodule.net", "apkmodule.org"],
  },
  {
    id: "WEB#3591353",
    status: "Offline",
    image: "https://placehold.co/80x80/f5f5f5/a3a3a3?text=W",
    url: "china.makepolo.com",
    aiInsight: false,
    posts: 178,
    notices: 0,
    label: "Counterfeit",
    labelColor: "bg-orange-500",
    clusters: "2",
    enforcement: "Escalated",
    lastCrawled: "2025-12-01T00:00:00Z",
    storeType: "Marketplace",
    country: "CN",
    relatedDomains: [],
  },
  {
    id: "WEB#2871029",
    status: "Online",
    image: "https://placehold.co/80x80/f5f5f5/a3a3a3?text=W",
    url: "replica-outlet.store",
    aiInsight: true,
    posts: 324,
    notices: 2,
    label: "Counterfeit",
    labelColor: "bg-orange-500",
    clusters: "5",
    enforcement: "Notice Sent",
    lastCrawled: "2026-03-18T00:00:00Z",
    storeType: "Independent Store",
    country: "DE",
    relatedDomains: ["replica-outlet.com", "replica-outlet.de", "replica-outlet.fr"],
  },
  {
    id: "WEB#1982744",
    status: "Offline",
    image: "https://placehold.co/80x80/f5f5f5/a3a3a3?text=W",
    url: "luxfakes.paris",
    aiInsight: false,
    posts: 12,
    notices: 1,
    label: "Trademark Abuse",
    labelColor: "bg-amber-500",
    clusters: "-",
    enforcement: "Taken Down",
    lastCrawled: "2025-11-15T00:00:00Z",
    storeType: "Social Commerce",
    country: "FR",
    relatedDomains: [],
  },
  {
    id: "WEB#4120588",
    status: "Online",
    image: "https://placehold.co/80x80/f5f5f5/a3a3a3?text=W",
    url: "bargain-brands.co.uk",
    aiInsight: true,
    posts: 89,
    notices: 0,
    label: "Phishing",
    labelColor: "bg-red-500",
    clusters: "1",
    enforcement: "-",
    lastCrawled: "2026-03-20T00:00:00Z",
    storeType: "Independent Store",
    country: "GB",
    relatedDomains: ["bargain-brands.com"],
  },
  {
    id: "WEB#5503912",
    status: "Online",
    image: "https://placehold.co/80x80/f5f5f5/a3a3a3?text=W",
    url: "knockoff-central.jp",
    aiInsight: false,
    posts: 203,
    notices: 3,
    label: "Counterfeit",
    labelColor: "bg-orange-500",
    clusters: "8",
    enforcement: "Escalated",
    lastCrawled: "2026-02-28T00:00:00Z",
    storeType: "Marketplace",
    country: "JP",
    relatedDomains: ["knockoff-central.com", "knockoff-central.cn"],
  },
];

const STICKY = "sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e5e5]";
const HEAD_TEXT = "text-[10px] uppercase font-bold text-neutral-700 tracking-wider";

export function WebsitesTable() {
  return (
    <div className="min-w-0 w-full relative">
      <Table className="w-full table-fixed min-w-[1200px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${STICKY} w-[50px] pl-4`}>
              <Checkbox />
            </TableHead>
            <TableHead className={`${STICKY} w-[50px] px-2 text-center ${HEAD_TEXT}`}>
              Image
            </TableHead>
            <TableHead className={`${STICKY} w-[140px] px-3 ${HEAD_TEXT}`}>ID</TableHead>
            <TableHead className={`${STICKY} w-[200px] px-3 ${HEAD_TEXT}`}>Website</TableHead>
            <TableHead className={`${STICKY} w-[80px] px-3 ${HEAD_TEXT}`}>AI Insight</TableHead>
            <TableHead className={`${STICKY} w-[80px] px-3 ${HEAD_TEXT}`}>Posts</TableHead>
            <TableHead className={`${STICKY} w-[80px] px-3 ${HEAD_TEXT}`}>Notices</TableHead>
            <TableHead className={`${STICKY} w-[140px] px-3 ${HEAD_TEXT}`}>Label</TableHead>
            <TableHead className={`${STICKY} w-[80px] px-3 ${HEAD_TEXT}`}>Clusters</TableHead>
            <TableHead className={`${STICKY} w-[120px] px-3 ${HEAD_TEXT}`}>Enforcement</TableHead>
            <TableHead className={`${STICKY} w-[50px]`} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_WEBSITES.map((site, rowIdx) => (
            <TableRow
              key={site.id}
              className="group cursor-pointer"
            >
              <TableCell className="pl-4">
                <Checkbox />
              </TableCell>

              <TableCell className="px-2">
                <ImageThumbnail src={site.image} alt={site.url} id={site.id} rowIndex={rowIdx} />
              </TableCell>

              <TableCell className="px-3">
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer truncate">
                    {site.id}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`size-1.5 rounded-full ${
                        site.status === "Online"
                          ? "bg-emerald-500"
                          : "bg-neutral-400"
                      }`}
                    />
                    <span
                      className={`text-[11px] font-medium ${
                        site.status === "Online"
                          ? "text-emerald-700"
                          : "text-neutral-500"
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-3">
                <WebsiteCell
                  websiteUrl={site.url}
                  isUp={site.status === "Online"}
                  lastCrawledDate={site.lastCrawled}
                  listingsCount={site.posts}
                  storeType={site.storeType}
                  country={site.country}
                  relatedDomains={site.relatedDomains}
                />
              </TableCell>

              <TableCell className="px-3">
                {site.aiInsight ? (
                  <RiRobot2Line className="size-4 text-neutral-400" />
                ) : (
                  <span className="text-[13px] text-muted-foreground">&mdash;</span>
                )}
              </TableCell>

              <TableCell className="px-3 tabular-nums text-[13px] text-foreground">
                {site.posts}
              </TableCell>

              <TableCell className="px-3 tabular-nums text-[13px] text-foreground">
                {site.notices}
              </TableCell>

              <TableCell className="px-3">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${site.labelColor}`} />
                  <span className="text-[13px] text-foreground">{site.label}</span>
                </div>
              </TableCell>

              <TableCell className="px-3 text-[13px] text-muted-foreground">
                {site.clusters}
              </TableCell>

              <TableCell className="px-3 text-[13px] text-foreground">
                {site.enforcement}
              </TableCell>

              <TableCell className="pr-3">
                <div className="flex items-center justify-center text-neutral-400 group-hover:text-neutral-900">
                  <RiArrowRightSLine className="h-5 w-5" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
