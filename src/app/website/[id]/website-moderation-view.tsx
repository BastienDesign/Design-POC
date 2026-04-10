"use client";

import { useState } from "react";
import {
  RiGlobalLine,
  RiFileTextLine,
  RiPulseLine,
  RiMoreLine,
  RiArrowDownSLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiInformationLine,
  RiRobot2Line,
  RiShieldCheckLine,
  RiShieldLine,
  RiTimeLine,
  RiAddLine,
  RiArrowRightSLine,
  RiLockLine,
  RiTranslate,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

/* ─── Mock Data ─── */

const VALIDATION_HISTORY = [
  {
    id: 1,
    action: "Moderated",
    actor: "System",
    timestamp: "31 Mar 2026, 09:30 (GMT+02:00)",
    type: "auto" as const,
    ruleName: "Rule #42: High-Risk Keyword Match",
    checks: 1,
  },
  {
    id: 2,
    action: "Checked",
    actor: "uyuusaf",
    timestamp: "31 Mar 2026, 09:35 (GMT+02:00)",
    type: "human" as const,
    checks: 2,
  },
  {
    id: 3,
    action: "Validated",
    actor: "uyuusaf",
    timestamp: "31 Mar 2026, 09:39 (GMT+02:00)",
    type: "human" as const,
    checks: 3,
  },
];

/* ─── Local Sub-Components ─── */

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="size-3.5 text-neutral-400" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">
        {label}
      </span>
    </div>
  );
}

function DataPoint({
  label,
  value,
  isLink = false,
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] text-neutral-500 mb-1">{label}</div>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-medium text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <div className="text-[12px] font-medium text-neutral-900">{value}</div>
      )}
    </div>
  );
}

function EditableField({
  label,
  defaultValue,
  type = "input",
  options,
}: {
  label: string;
  defaultValue: string;
  type?: "input" | "select";
  options?: string[];
}) {
  return (
    <div>
      <div className="text-[10px] text-neutral-500 mb-1">{label}</div>
      {type === "select" && options ? (
        <Select defaultValue={defaultValue}>
          <SelectTrigger className="h-8 text-xs w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input className="h-8 text-xs" defaultValue={defaultValue} />
      )}
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  iconColor,
  action,
  detail,
  time,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  action: string;
  detail?: string;
  time: string;
}) {
  return (
    <div className="flex gap-3 mb-4 relative">
      <div className="size-6 rounded-full bg-white border border-neutral-200 flex items-center justify-center z-10 shrink-0">
        <Icon className={`size-3 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-medium text-neutral-900">
            {action}
          </span>
          <span className="text-[10px] text-neutral-500 whitespace-nowrap">
            {time}
          </span>
        </div>
        {detail && (
          <span className="text-[11px] text-neutral-500">{detail}</span>
        )}
      </div>
    </div>
  );
}

function TimelineGroup({
  date,
  items,
}: {
  date: string;
  items: {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    action: string;
    detail?: string;
    time: string;
  }[];
}) {
  return (
    <>
      <div className="text-xs font-bold text-neutral-900 mt-6 first:mt-0 mb-4">
        {date}
      </div>
      <div className="relative pl-0">
        <div className="absolute left-[11px] top-3 bottom-0 border-l border-neutral-200" />
        {items.map((item, i) => (
          <TimelineItem key={i} {...item} />
        ))}
      </div>
    </>
  );
}

/* ─── Main Page ─── */

export function WebsiteModerationView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [descLang, setDescLang] = useState<"en" | "vo">("en");

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Top Header ── */}
      <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 bg-green-500 rounded-full" />
            <span className="text-[11px] text-neutral-500">Online</span>
          </div>
          <span className="text-lg font-bold text-neutral-900">WEB#81</span>
          <span className="text-[11px] text-neutral-400">
            16 Apr 2021, 19:16
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-help hover:text-neutral-800 transition-colors group mr-2">
                <div className="flex items-center gap-1 underline decoration-dashed decoration-neutral-300 underline-offset-4 group-hover:decoration-neutral-400 transition-colors">
                  <RiInformationLine className="size-3 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                  <span>Validated by uyuusaf!</span>
                </div>
                <div className="flex">
                  <RiCheckLine className="size-3.5 text-emerald-500 -mr-1" />
                  <RiCheckLine className="size-3.5 text-emerald-500" />
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent align="end" className="w-80 p-0 shadow-lg">
              <div className="flex flex-col">
                <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50 rounded-t-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Validation History
                  </span>
                </div>
                <div className="p-2">
                  {VALIDATION_HISTORY.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-2 hover:bg-neutral-50 rounded-md transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                          {item.type === "auto" && (
                            <RiRobot2Line className="size-3.5 text-blue-500" />
                          )}
                          {item.action} by {item.actor}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {item.timestamp}
                        </span>
                        {item.type === "auto" && item.ruleName && (
                          <span className="text-[10px] font-medium text-blue-600 mt-0.5 bg-blue-50 w-fit px-1.5 py-0.5 rounded">
                            {item.ruleName}
                          </span>
                        )}
                      </div>
                      <div className="flex text-emerald-500">
                        {Array.from({ length: item.checks }).map((_, i) => (
                          <RiCheckLine
                            key={i}
                            className={`size-3.5 ${i > 0 ? "-ml-1.5" : ""}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs px-3 rounded-md gap-1">
                Counterfeit
                <RiArrowDownSLine className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs">
                Counterfeit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                Suspicious
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                Legitimate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-neutral-900 hover:bg-neutral-800 text-white h-8 text-xs px-4 rounded-md">
            Enforce
          </Button>

          <Button variant="ghost" size="icon" className="size-8 p-0">
            <RiMoreLine className="size-4 text-neutral-500" />
          </Button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0 bg-white">
        {/* ── Left Pane (Main Stage) ── */}
        <div className="flex-1 bg-neutral-50 flex flex-col min-w-0">
          <ResizablePanelGroup orientation="vertical">
            {/* TOP PANEL: Website Preview */}
            <ResizablePanel
              defaultSize={70}
              minSize={30}
              className="flex flex-col relative bg-white"
            >
              {/* Fake Browser Chrome */}
              <div className="h-10 bg-neutral-100 border-b border-neutral-200 flex items-center px-3 gap-4 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-neutral-300" />
                  <span className="size-3 rounded-full bg-neutral-300" />
                  <span className="size-3 rounded-full bg-neutral-300" />
                </div>
                <div className="flex-1 max-w-md h-6 bg-white rounded flex items-center px-2 text-[11px] text-neutral-500 border border-neutral-200 gap-1.5">
                  <RiLockLine className="size-3 text-neutral-400 shrink-0" />
                  <span className="truncate">
                    https://www.tinkerlust.com/products/luxury-handbags
                  </span>
                </div>
              </div>

              {/* Iframe */}
              <div className="flex-1 relative overflow-hidden w-full min-h-0">
                <iframe
                  src="https://www.wikipedia.org"
                  className="absolute inset-0 w-full h-full border-0"
                  title="Website Preview"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  loading="lazy"
                />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-neutral-200" />

            {/* BOTTOM PANEL: Data & Comments Drawer */}
            <ResizablePanel
              defaultSize={30}
              minSize={10}
              collapsible
              className="bg-white flex flex-col min-h-0"
            >
              <Tabs
                defaultValue="websites"
                className="flex flex-col h-full min-h-0"
              >
                <div className="px-4 border-b border-neutral-200 shrink-0 bg-neutral-50">
                  <TabsList
                    variant="line"
                    className="bg-transparent h-10 p-0 gap-6 w-auto"
                  >
                    <TabsTrigger
                      value="websites"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-2.5 text-xs font-medium"
                    >
                      Related Websites
                      <Badge
                        variant="secondary"
                        className="ml-1.5 text-[9px] px-1 py-0 bg-neutral-200"
                      >
                        3
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="images"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-2.5 text-xs font-medium"
                    >
                      Related Images
                      <Badge
                        variant="secondary"
                        className="ml-1.5 text-[9px] px-1 py-0 bg-neutral-200"
                      >
                        12
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="posts"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-2.5 text-xs font-medium"
                    >
                      Related Posts
                    </TabsTrigger>
                    <TabsTrigger
                      value="comments"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 py-2.5 text-xs font-medium"
                    >
                      Comments
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="websites"
                  className="flex-1 overflow-auto p-4 m-0 outline-none"
                >
                  <div className="h-full flex items-center justify-center border border-dashed border-neutral-300 rounded text-neutral-400 text-xs">
                    [DataTable: Related Websites]
                  </div>
                </TabsContent>

                <TabsContent
                  value="images"
                  className="flex-1 overflow-auto p-4 m-0 outline-none"
                >
                  <div className="h-full flex items-center justify-center border border-dashed border-neutral-300 rounded text-neutral-400 text-xs">
                    [DataTable: Related Images]
                  </div>
                </TabsContent>

                <TabsContent
                  value="posts"
                  className="flex-1 overflow-auto p-4 m-0 outline-none"
                >
                  <div className="h-full flex items-center justify-center border border-dashed border-neutral-300 rounded text-neutral-400 text-xs">
                    [DataTable: Related Posts]
                  </div>
                </TabsContent>

                <TabsContent
                  value="comments"
                  className="flex-1 overflow-auto p-4 m-0 outline-none"
                >
                  <div className="h-full flex items-center justify-center border border-dashed border-neutral-300 rounded text-neutral-400 text-xs">
                    [Comments thread]
                  </div>
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* ── Right Pane (Sidebar) ── */}
        <div className="w-[450px] border-l border-neutral-200 bg-white flex flex-col shrink-0 min-h-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Tabs Header */}
            <div className="flex items-center border-b border-neutral-200 bg-white h-12 px-4 shrink-0">
              <TabsList
                variant="line"
                className="flex gap-6 bg-transparent rounded-none h-full w-auto p-0"
              >
                <TabsTrigger
                  value="overview"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiGlobalLine className="size-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiFileTextLine className="size-3.5" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="text-xs font-medium text-neutral-500 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none rounded-none px-0 py-3 bg-transparent gap-1.5"
                >
                  <RiPulseLine className="size-3.5" />
                  Activity
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 min-h-0">
              {/* ── Overview Tab ── */}
              <TabsContent value="overview" className="p-5 space-y-6 pb-20 m-0">
                {/* Domain Intelligence */}
                <section>
                  <SectionHeader icon={RiGlobalLine} label="Domain Intelligence" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Domain Name" value="tinkerlust.com" />
                    <DataPoint label="Top Level Domain" value=".com" />
                    <DataPoint label="Creation Date" value="12 Jan 2015" />
                    <DataPoint label="Expiry Date" value="12 Jan 2026" />
                    <DataPoint label="Registrar" value="GoDaddy LLC" />
                    <DataPoint label="Domain Contact" value="REDACTED FOR PRIVACY" />
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-neutral-500">
                        Description
                      </span>
                      <div className="flex items-center bg-neutral-100 p-0.5 rounded border border-neutral-200">
                        <button
                          onClick={() => setDescLang("en")}
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-sm transition-all ${
                            descLang === "en"
                              ? "bg-white shadow-sm text-neutral-900"
                              : "text-neutral-500 hover:text-neutral-700"
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setDescLang("vo")}
                          className={`px-2 py-0.5 flex items-center justify-center rounded-sm transition-all ${
                            descLang === "vo"
                              ? "bg-white shadow-sm text-neutral-900"
                              : "text-neutral-500 hover:text-neutral-700"
                          }`}
                          title="Original Version"
                        >
                          <RiTranslate className="size-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-neutral-900 leading-relaxed bg-neutral-50 border border-neutral-100 p-3 rounded min-h-[60px]">
                      {descLang === "en"
                        ? "Tinkerlust is an Indonesian online marketplace specializing in pre-owned luxury goods, including handbags, watches, jewelry, and accessories from premium brands. The platform connects buyers and sellers of authenticated second-hand luxury items."
                        : "Tinkerlust adalah pasar online Indonesia yang mengkhususkan diri pada barang mewah bekas, termasuk tas tangan, jam tangan, perhiasan, dan aksesori dari merek premium. Platform ini menghubungkan pembeli dan penjual barang mewah bekas yang telah diautentikasi."}
                    </div>
                  </div>
                </section>

                {/* Hosting & Infrastructure */}
                <section>
                  <SectionHeader
                    icon={RiShieldCheckLine}
                    label="Hosting & Infrastructure"
                  />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Hosting Provider" value="Cloudflare, Inc." />
                    <DataPoint
                      label="Abuse Contact"
                      value="abuse@cloudflare.com"
                      isLink
                    />
                    <DataPoint label="Estimated Geo" value="Indonesia (ID)" />
                    <DataPoint
                      label="Organization"
                      value="PT Tinkerlust Digital Indonesia"
                    />
                    <DataPoint label="DNS Provider" value="Cloudflare DNS" />
                    <DataPoint
                      label="Email Infrastructure"
                      value="Google Workspace"
                    />
                  </div>
                </section>

                {/* Related Content */}
                <section>
                  <SectionHeader icon={RiFileTextLine} label="Related Content" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="Related Posts" value="0" />
                    <DataPoint label="Related Images" value="0" />
                    <DataPoint label="Related Domains" value="3" />
                    <DataPoint label="Related Sellers" value="1" />
                  </div>
                </section>

                {/* Activity & Behaviour */}
                <section>
                  <SectionHeader icon={RiPulseLine} label="Activity & Behaviour" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <DataPoint label="First Detected" value="16 Apr 2021, 19:16" />
                    <DataPoint label="Last Crawled" value="31 Mar 2026, 08:42" />
                    <DataPoint label="Category" value="Marketplace" />
                    <DataPoint label="Risk Score" value="High (87/100)" />
                  </div>
                </section>

                {/* Tags */}
                <section>
                  <SectionHeader icon={RiShieldLine} label="Tags" />
                  <div className="flex flex-wrap gap-1.5">
                    {["luxury", "marketplace", "indonesia", "handbags", "pre-owned"].map(
                      (tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] font-normal"
                        >
                          {tag}
                        </Badge>
                      )
                    )}
                    <button className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-normal text-neutral-500 border border-dashed border-neutral-300 rounded-full hover:border-neutral-400 hover:text-neutral-700 transition-colors">
                      <RiAddLine className="size-3" />
                      New Tag
                    </button>
                  </div>
                </section>

                {/* IP Assets & Documents */}
                <section>
                  <SectionHeader
                    icon={RiShieldCheckLine}
                    label="IP Assets & Documents"
                  />
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div>
                      <div className="text-[10px] text-neutral-500 mb-1">
                        IP Asset
                      </div>
                      <Select>
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue placeholder="Select asset..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tm-word" className="text-xs">
                            Trademark — Word Mark
                          </SelectItem>
                          <SelectItem value="tm-logo" className="text-xs">
                            Trademark — Logo Mark
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500 mb-1">
                        Document
                      </div>
                      <Select>
                        <SelectTrigger className="h-8 text-xs w-full">
                          <SelectValue placeholder="Select document..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cert-1" className="text-xs">
                            US-TM-2024-0891
                          </SelectItem>
                          <SelectItem value="cert-2" className="text-xs">
                            EU-TM-2023-4412
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>
              </TabsContent>

              {/* ── Details Tab ── */}
              <TabsContent value="details" className="p-5 space-y-6 pb-20 m-0">
                <section>
                  <SectionHeader icon={RiGlobalLine} label="Domain Intelligence" />
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <EditableField label="Domain Name" defaultValue="tinkerlust.com" />
                    <EditableField
                      label="Top Level Domain"
                      defaultValue=".com"
                      type="select"
                      options={[".com", ".net", ".org", ".io", ".co"]}
                    />
                    <EditableField label="Creation Date" defaultValue="12 Jan 2015" />
                    <EditableField label="Expiry Date" defaultValue="12 Jan 2026" />
                    <EditableField label="Registrar" defaultValue="GoDaddy LLC" />
                    <EditableField
                      label="Domain Contact"
                      defaultValue="REDACTED FOR PRIVACY"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="text-[10px] text-neutral-500 mb-1">
                      Description
                    </div>
                    <textarea
                      defaultValue="Tinkerlust is an Indonesian online marketplace specializing in pre-owned luxury goods, including handbags, watches, jewelry, and accessories from premium brands."
                      className="w-full h-20 text-[11px] leading-relaxed text-neutral-700 border border-neutral-200 rounded p-3 bg-neutral-50 resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring"
                    />
                  </div>
                </section>

                <section>
                  <SectionHeader
                    icon={RiShieldCheckLine}
                    label="Hosting & Infrastructure"
                  />
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <EditableField
                      label="Hosting Provider"
                      defaultValue="Cloudflare, Inc."
                    />
                    <EditableField
                      label="Abuse Contact"
                      defaultValue="abuse@cloudflare.com"
                    />
                    <EditableField
                      label="Estimated Geo"
                      defaultValue="Indonesia (ID)"
                      type="select"
                      options={[
                        "Indonesia (ID)",
                        "United States (US)",
                        "China (CN)",
                        "United Kingdom (GB)",
                      ]}
                    />
                    <EditableField
                      label="Organization"
                      defaultValue="PT Tinkerlust Digital Indonesia"
                    />
                    <EditableField label="DNS Provider" defaultValue="Cloudflare DNS" />
                    <EditableField
                      label="Email Infrastructure"
                      defaultValue="Google Workspace"
                      type="select"
                      options={[
                        "Google Workspace",
                        "Microsoft 365",
                        "Self-hosted",
                        "Other",
                      ]}
                    />
                  </div>
                </section>

                <section>
                  <SectionHeader icon={RiPulseLine} label="Activity & Behaviour" />
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <EditableField
                      label="First Detected"
                      defaultValue="16 Apr 2021, 19:16"
                    />
                    <EditableField
                      label="Last Crawled"
                      defaultValue="31 Mar 2026, 08:42"
                    />
                    <EditableField
                      label="Category"
                      defaultValue="Marketplace"
                      type="select"
                      options={[
                        "Marketplace",
                        "Standalone Store",
                        "Social Commerce",
                        "Auction",
                      ]}
                    />
                    <EditableField label="Risk Score" defaultValue="87" />
                  </div>
                </section>
              </TabsContent>

              {/* ── Activity Tab ── */}
              <TabsContent value="activity" className="p-5 pb-20 m-0">
                <Select defaultValue="all">
                  <SelectTrigger className="h-8 text-xs w-[180px] mb-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Activity
                    </SelectItem>
                    <SelectItem value="validations" className="text-xs">
                      Validations
                    </SelectItem>
                    <SelectItem value="enforcement" className="text-xs">
                      Enforcement
                    </SelectItem>
                    <SelectItem value="system" className="text-xs">
                      System
                    </SelectItem>
                  </SelectContent>
                </Select>

                <TimelineGroup
                  date="31 Mar 2026"
                  items={[
                    {
                      icon: RiCheckDoubleLine,
                      iconColor: "text-green-500",
                      action: "Validated as Counterfeit",
                      detail: "by uyuusaf!",
                      time: "08:42",
                    },
                    {
                      icon: RiShieldLine,
                      iconColor: "text-red-500",
                      action: "Label set to Counterfeit",
                      detail: "Automatic classification",
                      time: "08:42",
                    },
                    {
                      icon: RiTimeLine,
                      iconColor: "text-neutral-500",
                      action: "Page crawled successfully",
                      detail: "200 OK — 1.2s response time",
                      time: "08:41",
                    },
                  ]}
                />

                <TimelineGroup
                  date="28 Mar 2026"
                  items={[
                    {
                      icon: RiShieldLine,
                      iconColor: "text-orange-500",
                      action: "Flagged as Suspicious",
                      detail: "ML confidence: 0.89",
                      time: "14:23",
                    },
                    {
                      icon: RiTimeLine,
                      iconColor: "text-neutral-500",
                      action: "Page crawled successfully",
                      detail: "200 OK — 0.8s response time",
                      time: "14:22",
                    },
                  ]}
                />

                <TimelineGroup
                  date="16 Apr 2021"
                  items={[
                    {
                      icon: RiGlobalLine,
                      iconColor: "text-blue-500",
                      action: "Domain first detected",
                      detail: "Added to monitoring queue",
                      time: "19:16",
                    },
                    {
                      icon: RiTimeLine,
                      iconColor: "text-neutral-500",
                      action: "Initial crawl completed",
                      detail: "200 OK — 2.1s response time",
                      time: "19:17",
                    },
                  ]}
                />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
