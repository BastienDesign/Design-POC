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
import { Badge } from "@/components/ui/badge";
import { RiExternalLinkLine, RiArrowRightSLine } from "@remixicon/react";
import { ImageThumbnail } from "./image-thumbnail";
import Link from "next/link";

/* ─── Types ─── */

interface AccountRow {
  id: string;
  name: string;
  status: "Active" | "Down";
  platform: string;
  avatarUrl: string;
  stats: {
    totalPosts: number;
    postsModPct: number;
    infringingPosts: number;
    infringingModPct: number;
    notices: number;
  };
  label: string | null;
}

/* ─── Mock Data ─── */

const MOCK_ACCOUNTS: AccountRow[] = [
  {
    id: "ACC-01",
    name: "【就愛日韓貨，連線，代購】",
    status: "Down",
    platform: "shopee.tw",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=101",
    stats: { totalPosts: 1274, postsModPct: 0, infringingPosts: 392, infringingModPct: 1, notices: 0 },
    label: null,
  },
  {
    id: "ACC-02",
    name: "【鞋老闆】運動休閒鞋 全新現貨",
    status: "Active",
    platform: "shopee.tw",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=102",
    stats: { totalPosts: 1047, postsModPct: 0, infringingPosts: 260, infringingModPct: 1, notices: 0 },
    label: "Counterfeit",
  },
  {
    id: "ACC-03",
    name: "KoreanStyle_Official",
    status: "Active",
    platform: "shopee.tw",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=103",
    stats: { totalPosts: 843, postsModPct: 12, infringingPosts: 198, infringingModPct: 5, notices: 2 },
    label: "Suspicious",
  },
  {
    id: "ACC-04",
    name: "branddeals_tw",
    status: "Active",
    platform: "shopee.tw",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=104",
    stats: { totalPosts: 2310, postsModPct: 3, infringingPosts: 871, infringingModPct: 0, notices: 0 },
    label: "Counterfeit",
  },
  {
    id: "ACC-05",
    name: "replica_king_88",
    status: "Down",
    platform: "lazada.co.th",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=105",
    stats: { totalPosts: 456, postsModPct: 45, infringingPosts: 312, infringingModPct: 22, notices: 5 },
    label: "Counterfeit",
  },
  {
    id: "ACC-06",
    name: "luxury_imports_ph",
    status: "Active",
    platform: "lazada.com.ph",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=106",
    stats: { totalPosts: 189, postsModPct: 0, infringingPosts: 47, infringingModPct: 0, notices: 0 },
    label: null,
  },
  {
    id: "ACC-07",
    name: "deal_hunter_23",
    status: "Active",
    platform: "shopee.sg",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=107",
    stats: { totalPosts: 631, postsModPct: 8, infringingPosts: 155, infringingModPct: 3, notices: 1 },
    label: "Suspicious",
  },
  {
    id: "ACC-08",
    name: "fashion_wholesale_vn",
    status: "Active",
    platform: "shopee.vn",
    avatarUrl: "https://loremflickr.com/400/400/avatar,person?lock=108",
    stats: { totalPosts: 3782, postsModPct: 1, infringingPosts: 1204, infringingModPct: 0, notices: 0 },
    label: "Counterfeit",
  },
];

/* ─── Styles ─── */

const STICKY = "sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#e5e5e5]";
const HEAD_TEXT = "text-[10px] uppercase font-bold text-neutral-700 tracking-wider";

const LABEL_STYLES: Record<string, string> = {
  Counterfeit: "bg-red-50 text-red-700 border-red-200",
  Suspicious: "bg-orange-50 text-orange-700 border-orange-200",
};

/* ─── Component ─── */

export function AccountsTable() {
  return (
    <div className="min-w-0 w-full relative">
      <Table className="w-full table-fixed min-w-[1100px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${STICKY} w-[50px] pl-4`}>
              <Checkbox />
            </TableHead>
            <TableHead className={`${STICKY} w-[50px] px-2 text-center ${HEAD_TEXT}`}>
              Image
            </TableHead>
            <TableHead className={`${STICKY} w-[240px] px-3 ${HEAD_TEXT}`}>
              Account
            </TableHead>
            <TableHead className={`${STICKY} w-[140px] px-3 ${HEAD_TEXT}`}>
              Website
            </TableHead>
            <TableHead className={`${STICKY} w-[120px] px-3 ${HEAD_TEXT}`}>
              Posts
            </TableHead>
            <TableHead className={`${STICKY} w-[140px] px-3 ${HEAD_TEXT}`}>
              Infringing Posts
            </TableHead>
            <TableHead className={`${STICKY} w-[80px] px-3 ${HEAD_TEXT}`}>
              Notices
            </TableHead>
            <TableHead className={`${STICKY} w-[130px] px-3 ${HEAD_TEXT}`}>
              Label
            </TableHead>
            <TableHead className={`${STICKY} w-[50px]`} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {MOCK_ACCOUNTS.map((account, rowIdx) => (
            <TableRow key={account.id} className="group cursor-pointer">
              <TableCell className="pl-4">
                <Checkbox />
              </TableCell>

              {/* Avatar */}
              <TableCell className="px-2">
                <ImageThumbnail
                  src={account.avatarUrl}
                  alt={account.name}
                  id={account.id}
                  rowIndex={rowIdx}
                />
              </TableCell>

              {/* Stacked: Name + Status */}
              <TableCell className="px-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <Link
                    href={`/account/${account.id}`}
                    className="text-[13px] font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors truncate cursor-pointer"
                  >
                    {account.name}
                  </Link>
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`size-1.5 rounded-full ${
                        account.status === "Active"
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        account.status === "Active"
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {account.status}
                    </span>
                  </span>
                </div>
              </TableCell>

              {/* Platform */}
              <TableCell className="px-3">
                <div className="flex items-center gap-1.5 text-[13px] text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                  <span className="truncate">{account.platform}</span>
                  <RiExternalLinkLine className="size-3.5 shrink-0" />
                </div>
              </TableCell>

              {/* Stacked: Total Posts + Mod % */}
              <TableCell className="px-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-neutral-900 tabular-nums">
                    {account.stats.totalPosts.toLocaleString("en-US")}
                  </span>
                  <span className="text-[11px] text-blue-500 font-medium">
                    {account.stats.postsModPct}% moderated
                  </span>
                </div>
              </TableCell>

              {/* Stacked: Infringing Posts + Mod % */}
              <TableCell className="px-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-neutral-900 tabular-nums">
                    {account.stats.infringingPosts.toLocaleString("en-US")}
                  </span>
                  <span className="text-[11px] text-blue-500 font-medium">
                    {account.stats.infringingModPct}% moderated
                  </span>
                </div>
              </TableCell>

              {/* Notices */}
              <TableCell className="px-3 tabular-nums text-[13px] text-foreground">
                {account.stats.notices}
              </TableCell>

              {/* Label */}
              <TableCell className="px-3">
                {account.label ? (
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-medium ${LABEL_STYLES[account.label] ?? "bg-neutral-50 text-neutral-700 border-neutral-200"}`}
                  >
                    {account.label}
                  </Badge>
                ) : (
                  <span className="text-[13px] text-muted-foreground">&mdash;</span>
                )}
              </TableCell>

              {/* Arrow */}
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
