"use client";

import {
  RiSearchLine,
  RiAddLine,
  RiMore2Line,
  RiPencilLine,
} from "@remixicon/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TEAM_USERS, ACTIVE_ORG } from "@/lib/mock-data";

function StatusDot({ status }: { status: "active" | "invited" }) {
  if (status === "active") {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span className="text-[13px]">Active</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-orange-500">
      <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
      <span className="text-[13px]">Pending</span>
    </span>
  );
}

export function UsersTable() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-8 py-4">
        <p className="text-[13px] font-medium text-neutral-500">
          Organizational Settings
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200/50 bg-white px-3 py-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-[8px] font-bold text-white">
            {ACTIVE_ORG.logo}
          </div>
          <span className="text-xs font-medium text-neutral-700">
            {ACTIVE_ORG.name}
          </span>
        </div>
      </div>

      {/* Page Title + Actions */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Users
          </h1>
          <Badge
            variant="secondary"
            className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            336
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600">
            <RiSearchLine className="h-[18px] w-[18px]" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600">
            <RiAddLine className="h-[18px] w-[18px]" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600">
            <RiMore2Line className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="rounded-xl border border-neutral-200/50 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-neutral-100 hover:bg-transparent">
                <TableHead className="w-[280px] pl-5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Name
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Email
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Role
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Status
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Last Login
                </TableHead>
                <TableHead className="w-[50px] text-[10px] font-bold uppercase tracking-wider text-neutral-400" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {TEAM_USERS.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-b border-neutral-100 transition-colors hover:bg-neutral-50/50"
                >
                  {/* Avatar + Name */}
                  <TableCell className="py-4 pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-neutral-100 text-xs font-semibold text-neutral-600">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {user.name}
                        </p>
                        <p className="text-[12px] text-neutral-400">
                          {user.subtitle}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="py-4 text-[13px] text-neutral-500">
                    {user.email}
                  </TableCell>

                  {/* Role */}
                  <TableCell className="py-4 text-[13px] font-medium text-neutral-700">
                    {user.roleLabel}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">
                    <StatusDot status={user.status} />
                  </TableCell>

                  {/* Last Login */}
                  <TableCell className="py-4 text-[13px] text-neutral-400">
                    {user.lastLogin}
                  </TableCell>

                  {/* Edit Action */}
                  <TableCell className="py-4 pr-5">
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-neutral-100 hover:text-neutral-500">
                      <RiPencilLine className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
