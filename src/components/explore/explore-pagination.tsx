"use client";

import { useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ExplorePagination() {
  const [page, setPage] = useState("1");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const totalPages = 93587;

  return (
    <div className="mt-auto flex w-full shrink-0 items-center justify-between border-t border-neutral-200 bg-white px-4 py-3">
      {/* Left: Rows per page */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page</span>
        <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
          <SelectTrigger size="sm" className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right: Page nav */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setPage((p) => String(Math.max(1, Number(p) - 1)))}
        >
          <RiArrowLeftSLine className="h-4 w-4" />
        </Button>
        <Input
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="h-7 w-12 text-center text-xs"
        />
        <span className="text-xs text-muted-foreground">
          of {totalPages.toLocaleString()}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setPage((p) => String(Math.min(totalPages, Number(p) + 1)))}
        >
          <RiArrowRightSLine className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
