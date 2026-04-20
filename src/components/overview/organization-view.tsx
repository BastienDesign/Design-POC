"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RiArrowDownSLine,
  RiArrowRightUpLine,
  RiArrowRightDownLine,
  RiFileList3Line,
  RiStoreLine,
  RiMapPin2Line,
  RiShieldCheckLine,
  RiPriceTag3Line,
  RiEyeLine,
  RiGlobalLine,
  RiImage2Line,
} from "@remixicon/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  kpiByApproach,
  trend12mo,
  timeToAction,
  funnelStages,
  geoBySellerOrigin,
  geoByTargetMarket,
  topMarketplaces,
  platformCompliance,
  repeatOffenders,
  infringingCategories,
  mostInfringedImages,
  formatThinSpace,
  formatCurrencyEUR,
  type Approach,
} from "@/lib/overview-data";

export function OrganizationView() {
  const [approach, setApproach] = useState<Approach>("unique");
  const [period, setPeriod] = useState("30d");
  const [mapMode, setMapMode] = useState<"origin" | "target">("origin");

  return (
    <div className="mt-6 space-y-10">
      <GlobalHeader
        approach={approach}
        onApproachChange={setApproach}
        period={period}
        onPeriodChange={setPeriod}
      />
      <KeyFigures approach={approach} />
      <Visibility />
      <LifecycleAndTiming />
      <RiskGeography mapMode={mapMode} onMapModeChange={setMapMode} />
      <DeepDive />
      <MostInfringedImages />
    </div>
  );
}

/* ─── I. Global Header ─── */
function GlobalHeader({
  approach,
  onApproachChange,
  period,
  onPeriodChange,
}: {
  approach: Approach;
  onApproachChange: (a: Approach) => void;
  period: string;
  onPeriodChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="h-9 w-[160px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last quarter</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <RiFileList3Line className="size-4" />
              Filters
              <Badge variant="secondary" className="ml-1">3</Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 text-sm">
            <p className="font-medium">Filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Slice data by category, marketplace, region, or label.
            </p>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ApproachToggle value={approach} onChange={onApproachChange} />
        <Button size="sm" variant="outline" className="h-9">
          <RiArrowDownSLine className="size-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}

function ApproachToggle({
  value,
  onChange,
}: {
  value: Approach;
  onChange: (v: Approach) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={value}
      onValueChange={(v) => v && onChange(v as Approach)}
      className="rounded-lg border border-neutral-200 bg-neutral-50 p-1"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="unique" className="h-7 px-3 text-xs">
            Unique Counts
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>
          Each infringing post is counted once, regardless of duplicates.
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="alternate" className="h-7 px-3 text-xs">
            Alternate Counts
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>
          Every duplicate detection is counted separately.
        </TooltipContent>
      </Tooltip>
    </ToggleGroup>
  );
}

/* ─── II. Key Figures ─── */
function KeyFigures({ approach }: { approach: Approach }) {
  const data = kpiByApproach[approach];

  const kpis = useMemo(
    () => [
      {
        key: "infringements",
        label: "Total Infringements",
        definition: "Total infringing posts in the chosen period.",
        value: formatThinSpace(data.infringements),
        trend: data.trends.infringements,
        trendPositiveIsGood: false,
        href: "/explore?status=infringement",
      },
      {
        key: "enforcements",
        label: "Total Enforcements",
        definition: "Total enforced posts in the chosen period.",
        value: formatThinSpace(data.enforcements),
        trend: data.trends.enforcements,
        trendPositiveIsGood: true,
        href: "/explore?status=enforced",
      },
      {
        key: "removals",
        label: "Total Removals",
        definition: "Total removed posts in the chosen period.",
        value: formatThinSpace(data.removals),
        trend: data.trends.removals,
        trendPositiveIsGood: true,
        href: "/explore?status=removed",
      },
      {
        key: "value",
        label: "Estimated Value Removed",
        definition: "Financial impact of the enforcement program.",
        value: formatCurrencyEUR(data.valueRemoved),
        trend: data.trends.valueRemoved,
        trendPositiveIsGood: true,
        href: "/explore?status=removed",
      },
    ],
    [data],
  );

  return (
    <Section
      number="II"
      title="Key Figures"
      description="High-level service value. Click any figure to drill into the Post Feed."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <KpiCard
            key={k.key}
            label={k.label}
            definition={k.definition}
            value={k.value}
            trend={k.trend}
            trendPositiveIsGood={k.trendPositiveIsGood}
            href={k.href}
            sparkKey={
              k.key === "infringements"
                ? "infringements"
                : k.key === "removals"
                  ? "removals"
                  : undefined
            }
          />
        ))}
        <ComplianceGaugeCard value={data.compliance} trend={data.trends.compliance} />
      </div>

      <TrendChart />
    </Section>
  );
}

function KpiCard({
  label,
  definition,
  value,
  trend,
  trendPositiveIsGood,
  href,
  sparkKey,
}: {
  label: string;
  definition: string;
  value: string;
  trend: number;
  trendPositiveIsGood: boolean;
  href: string;
  sparkKey?: "infringements" | "removals";
}) {
  const isUp = trend >= 0;
  const isGood = isUp === trendPositiveIsGood;

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          {label}
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help text-neutral-300">?</span>
          </TooltipTrigger>
          <TooltipContent side="top">{definition}</TooltipContent>
        </Tooltip>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
        {value}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <Badge variant={isGood ? "secondary" : "destructive"} className="gap-0.5">
          {isUp ? (
            <RiArrowRightUpLine className="size-3" />
          ) : (
            <RiArrowRightDownLine className="size-3" />
          )}
          {Math.abs(trend).toFixed(1)}%
        </Badge>
        {sparkKey && <Sparkline dataKey={sparkKey} color="var(--primary)" />}
      </div>
    </Link>
  );
}

function Sparkline({
  dataKey,
  color,
}: {
  dataKey: "infringements" | "removals";
  color: string;
}) {
  const config: ChartConfig = {
    [dataKey]: { label: dataKey, color },
  };
  return (
    <ChartContainer config={config} className="h-8 w-24 aspect-auto">
      <AreaChart data={trend12mo} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${dataKey})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function ComplianceGaugeCard({ value, trend }: { value: number; trend: number }) {
  const color =
    value >= 80
      ? "var(--primary)"
      : value >= 60
        ? "var(--chart-3)"
        : "var(--destructive)";

  const config: ChartConfig = {
    compliance: { label: "Compliance", color },
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        Average Compliance
      </p>
      <div className="mt-1 flex items-center gap-3">
        <ChartContainer config={config} className="aspect-auto h-20 w-24">
          <RadialBarChart
            data={[{ name: "Compliance", value, fill: color }]}
            startAngle={180}
            endAngle={0}
            innerRadius="75%"
            outerRadius="100%"
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={6} background isAnimationActive={false} />
          </RadialBarChart>
        </ChartContainer>
        <div>
          <p className="text-2xl font-bold tracking-tight text-neutral-900">
            {value}%
          </p>
          <Badge
            variant={trend >= 0 ? "secondary" : "destructive"}
            className="mt-1 gap-0.5"
          >
            {trend >= 0 ? (
              <RiArrowRightUpLine className="size-3" />
            ) : (
              <RiArrowRightDownLine className="size-3" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </Badge>
        </div>
      </div>
    </div>
  );
}

function TrendChart() {
  const config: ChartConfig = {
    infringements: { label: "Infringements", color: "var(--chart-2)" },
    removals: { label: "Removals", color: "var(--chart-4)" },
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Infringements vs Removals — last 12 months
        </CardTitle>
        <CardDescription>
          Monthly volume trend across the organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-72 w-full aspect-auto">
          <LineChart data={trend12mo} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              width={42}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Line
              type="monotone"
              dataKey="infringements"
              stroke="var(--color-infringements)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="removals"
              stroke="var(--color-removals)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/* ─── III. Visibility (as-is placeholder) ─── */
function Visibility() {
  return (
    <Section
      number="III"
      title="Visibility"
      description="Kept as-is — uses the existing Visibility widgets."
    >
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 text-sm text-neutral-400">
        [ Visibility section — unchanged ]
      </div>
    </Section>
  );
}

/* ─── IV + V. Time to Action & Lifecycle Funnel ─── */
function LifecycleAndTiming() {
  return (
    <Section
      number="IV"
      title="Time to Action & Takedown Lifecycle"
      description="Speed of action across the moderation-to-removal funnel."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Time to Action</CardTitle>
            <CardDescription>Average durations across the pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {timeToAction.map((t) => (
              <div
                key={t.key}
                className="rounded-lg border border-neutral-200 bg-neutral-50/40 p-3"
              >
                <p className="text-xs font-medium text-neutral-500">{t.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                  {t.value}
                  <span className="ml-1 text-sm font-normal text-neutral-500">
                    {t.unit}
                  </span>
                </p>
                <p className="mt-1 text-xs leading-tight text-neutral-400">
                  {t.hint}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Takedown Lifecycle Funnel</CardTitle>
                <CardDescription>
                  Click any stage to jump into the Post Feed.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Funnel />
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}

function Funnel() {
  const max = funnelStages[0].value;
  return (
    <ol className="space-y-3">
      {funnelStages.map((stage, i) => {
        const width = (stage.value / max) * 100;
        const next = funnelStages[i + 1];
        const conversion = next ? (next.value / stage.value) * 100 : null;
        return (
          <li key={stage.key}>
            <Link
              href={stage.href}
              className="group block rounded-lg border border-neutral-200 bg-white p-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50/60"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="size-5 rounded-full p-0">
                    {i + 1}
                  </Badge>
                  <p className="text-sm font-medium text-neutral-900">
                    {stage.label}
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900">
                  {formatThinSpace(stage.value)}
                </p>
              </div>
              <Progress value={width} className="mt-2 h-2" />
              {conversion !== null && (
                <p className="mt-1.5 text-xs text-neutral-500">
                  → {conversion.toFixed(1)}% continue to{" "}
                  <span className="font-medium text-neutral-700">{next!.label}</span>
                </p>
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/* ─── VI. Risk & Geographic Overview ─── */
function RiskGeography({
  mapMode,
  onMapModeChange,
}: {
  mapMode: "origin" | "target";
  onMapModeChange: (m: "origin" | "target") => void;
}) {
  return (
    <Section
      number="VI"
      title="Risk & Geographic Overview"
      description="Where enforcement volume is concentrated across the world."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <GeoHeatmap mapMode={mapMode} onMapModeChange={onMapModeChange} />
        <TopMarketplacesTable />
      </div>
      <PlatformCompliance />
    </Section>
  );
}

function GeoHeatmap({
  mapMode,
  onMapModeChange,
}: {
  mapMode: "origin" | "target";
  onMapModeChange: (m: "origin" | "target") => void;
}) {
  const data = mapMode === "origin" ? geoBySellerOrigin : geoByTargetMarket;
  const config: ChartConfig = {
    enforcements: { label: "Enforcements", color: "var(--chart-2)" },
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RiGlobalLine className="size-4 text-neutral-500" />
            <CardTitle className="text-base">Global Enforcement Map</CardTitle>
          </div>
          <ToggleGroup
            type="single"
            size="sm"
            value={mapMode}
            onValueChange={(v) => v && onMapModeChange(v as "origin" | "target")}
            className="rounded-lg border border-neutral-200 bg-neutral-50 p-1"
          >
            <ToggleGroupItem value="origin" className="h-7 px-2.5 text-xs">
              Seller origin
            </ToggleGroupItem>
            <ToggleGroupItem value="target" className="h-7 px-2.5 text-xs">
              Targeted markets
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <CardDescription>
          {mapMode === "origin"
            ? "Where infringing sellers are based."
            : "Where infringing listings are targeted at buyers."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[340px] w-full aspect-auto">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 20, bottom: 0 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="country"
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    const row = item?.payload as (typeof data)[number] | undefined;
                    return (
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          {row?.country} ({row?.code})
                        </p>
                        <p className="font-mono text-sm font-semibold">
                          {formatThinSpace(Number(value))} enforcements
                        </p>
                        {row && (
                          <p className="text-xs text-muted-foreground">
                            {formatCurrencyEUR(row.value)} value
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar dataKey="enforcements" fill="var(--color-enforcements)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function TopMarketplacesTable() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <RiStoreLine className="size-4 text-neutral-500" />
          <CardTitle className="text-base">Top High-Risk Marketplaces</CardTitle>
        </div>
        <CardDescription>
          Where the brand is most vulnerable — ranked by enforced listings.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50/60">
              <TableHead className="pl-6">Marketplace</TableHead>
              <TableHead className="text-right">Enforced</TableHead>
              <TableHead className="text-right">Share</TableHead>
              <TableHead>Top Category</TableHead>
              <TableHead className="pr-6">Top Label</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topMarketplaces.map((m) => (
              <TableRow key={m.name} className="hover:bg-neutral-50/60">
                <TableCell className="pl-6 font-medium">
                  <div className="flex flex-col">
                    <span>{m.name}</span>
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                      <RiMapPin2Line className="size-3" />
                      {m.country}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatThinSpace(m.enforced)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      m.share >= 20
                        ? "destructive"
                        : m.share >= 10
                          ? "secondary"
                          : "outline"
                    }
                    className="font-mono tabular-nums"
                  >
                    {m.share.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-neutral-700">
                  {m.topCategory}
                </TableCell>
                <TableCell className="pr-6">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <RiPriceTag3Line className="size-3" />
                    {m.topLabel}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PlatformCompliance() {
  const config: ChartConfig = {
    compliance: { label: "Compliance", color: "var(--primary)" },
  };
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <RiShieldCheckLine className="size-4 text-neutral-500" />
          <CardTitle className="text-base">Platform Compliance</CardTitle>
        </div>
        <CardDescription>
          Response rate per marketplace over the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-64 w-full aspect-auto">
          <BarChart data={platformCompliance} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="compliance" fill="var(--color-compliance)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/* ─── VII. Offender & Product Deep Dive ─── */
function DeepDive() {
  return (
    <Section
      number="VII"
      title="Offender & Product Deep Dive"
      description="Tactical follow-up — repeat infringers and category performance."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Repeat Marketplace Offenders</CardTitle>
            <CardDescription>
              Click a username to open the account page.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/60">
                  <TableHead className="pl-6">User</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Enforced</TableHead>
                  <TableHead className="pr-6 text-right">Removed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repeatOffenders.map((o) => (
                  <TableRow key={o.id} className="hover:bg-neutral-50/60">
                    <TableCell className="pl-6">
                      <Link
                        href={`/account/${o.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {o.username}
                      </Link>
                    </TableCell>
                    <TableCell>{o.platform}</TableCell>
                    <TableCell className="text-sm text-neutral-600">
                      {o.country}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatThinSpace(o.enforcements)}
                    </TableCell>
                    <TableCell className="pr-6 text-right font-mono tabular-nums">
                      {formatThinSpace(o.removals)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Most Infringing Product Categories</CardTitle>
            <CardDescription>Compliance per category.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/60">
                  <TableHead className="pl-6">Category</TableHead>
                  <TableHead className="text-right">Enforced</TableHead>
                  <TableHead className="text-right">Removed</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="pr-6">Compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {infringingCategories.map((c) => (
                  <TableRow key={c.name} className="hover:bg-neutral-50/60">
                    <TableCell className="pl-6 font-medium">{c.name}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatThinSpace(c.enforcements)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatThinSpace(c.removals)}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatThinSpace(c.stockRemoved)}
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex items-center gap-2">
                        <Progress value={c.compliance} className="h-1.5 w-20" />
                        <span className="text-xs font-medium tabular-nums text-neutral-700">
                          {c.compliance}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}

/* ─── VIII. Most Infringed Images ─── */
function MostInfringedImages() {
  return (
    <Section
      number="VIII"
      title="Most Infringed Images"
      description="Top 20 images appearing most frequently in infringing posts."
    >
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {mostInfringedImages.map((img, i) => (
              <Link
                key={img.id}
                href={`/image/${img.id}`}
                className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
              >
                <div className="relative aspect-square">
                  <Image
                    src={img.url}
                    alt={`Infringed image ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                  <Badge variant="default" className="absolute left-2 top-2">
                    #{i + 1}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5 text-xs">
                  <span className="inline-flex items-center gap-1 text-neutral-600">
                    <RiImage2Line className="size-3.5" />
                    <span className="font-mono font-semibold tabular-nums">
                      {formatThinSpace(img.postCount)}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-neutral-600">
                    <RiStoreLine className="size-3.5" />
                    <span className="font-mono font-semibold tabular-nums">
                      {img.marketplaceCount}
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <RiEyeLine className="size-3.5" />
              Metric 1: posts containing the image
            </span>
            <span className="mx-3 text-neutral-300">·</span>
            <span className="inline-flex items-center gap-1">
              <RiStoreLine className="size-3.5" />
              Metric 2: distinct marketplaces using the image
            </span>
          </p>
        </CardContent>
      </Card>
    </Section>
  );
}

/* ─── Section wrapper ─── */
function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-bold tracking-widest text-neutral-400">
          {number}
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-neutral-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
