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

export function WebsitesTable() {
  return (
    <div className="flex-1 min-h-0 min-w-0 w-full overflow-auto border border-neutral-200 rounded-md bg-white shadow-sm mb-4 relative">
      <Table className="w-full table-fixed min-w-[1200px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40px] pl-4">
              <Checkbox />
            </TableHead>
            <TableHead className="w-[64px] px-2 text-center text-[10px] uppercase font-bold text-neutral-700 tracking-wider">
              Image
            </TableHead>
            <TableHead className="w-[140px] px-3 text-[10px] uppercase font-bold text-neutral-700 tracking-wider">
              ID
            </TableHead>
            <TableHead className="w-[200px] px-3 text-[10px] uppercase font-bold text-neutral-700 tracking-wider">
              Website
            </TableHead>
            <TableHead className="w-[80px] px-3 text-[10px] uppercase font-bold text-neutral-700 tracking-wider">
              AI Insight
            </TableHead>
            <TableHead className="w-[80px] px-3 text-[10px] uppercase font-bold text-neutral-700 tracking-wider">
              Posts
            </TableHead>
            <TableHead className="w-[80px] px-3 text-[10px] uppercase font-bold text-neutral-700 tracking-wider">
              Notices
            </TableHead>
            <TableHead className="w-[140px] px-3 text-[10px] uppercase font-bold text-neutral-700 tracking-wider">
              Label
            </TableHead>
            <TableHead className="w-[80px] px-3 text-[10px] uppercase font-bold text-neutral-700 tracking-wider">
              Clusters
            </TableHead>
            <TableHead className="w-[120px] px-3 text-[10px] uppercase font-bold text-neutral-700 tracking-wider">
              Enforcement
            </TableHead>
            <TableHead className="w-[40px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_WEBSITES.map((site) => (
            <TableRow
              key={site.id}
              className="group hover:bg-neutral-50/50 transition-colors"
            >
              <TableCell className="py-2.5 px-4 w-[40px]">
                <Checkbox className="border-neutral-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
              </TableCell>

              {/* Exact clone of Posts image cell */}
              <TableCell className="py-2.5 px-4 w-[60px]">
                {site.image && site.image !== "" ? (
                  <img
                    src={site.image}
                    alt=""
                    className="size-[38px] min-w-[38px] rounded-md object-cover bg-neutral-100"
                  />
                ) : (
                  <div className="size-[38px] min-w-[38px] rounded-md bg-neutral-100" />
                )}
              </TableCell>

              <TableCell className="py-2.5 px-4 max-w-[120px]">
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

              <TableCell className="py-2.5 px-4">
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

              <TableCell className="py-2.5 px-4">
                {site.aiInsight ? (
                  <RiRobot2Line className="size-4 text-neutral-400" />
                ) : (
                  <span className="text-neutral-300">-</span>
                )}
              </TableCell>

              <TableCell className="py-2.5 px-4 tabular-nums text-sm text-neutral-700">
                {site.posts}
              </TableCell>

              <TableCell className="py-2.5 px-4 tabular-nums text-sm text-neutral-700">
                {site.notices}
              </TableCell>

              <TableCell className="py-2.5 px-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${site.labelColor}`}
                  />
                  <span className="text-sm text-neutral-700">
                    {site.label}
                  </span>
                </div>
              </TableCell>

              <TableCell className="py-2.5 px-4 text-sm text-neutral-500">
                {site.clusters}
              </TableCell>

              <TableCell className="py-2.5 px-4 text-sm text-neutral-600">
                {site.enforcement}
              </TableCell>

              <TableCell className="py-2.5 px-4 text-right">
                <button className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors opacity-0 group-hover:opacity-100 rounded">
                  <RiArrowRightSLine className="size-5" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
