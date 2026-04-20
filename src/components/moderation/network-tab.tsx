"use client";

import Link from "next/link";
import {
  RiAlertLine,
  RiCheckLine,
  RiFileTextLine,
  RiFlashlightLine,
  RiGlobalLine,
  RiHammerLine,
  RiImage2Line,
  RiNodeTree,
  RiShieldCrossLine,
  RiUserLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type NetworkEntityKind =
  | "image"
  | "post"
  | "website"
  | "account"
  | "seller";

export interface NetworkEntity {
  id: string;
  kind: NetworkEntityKind;
  name: string;
  subtitle?: string;
  riskScore: number; // 0-100
  href?: string;
}

export interface NetworkTabProps {
  /** Label of the parent moderator verdict (e.g. "Counterfeit") */
  clusterLabel: string;
  /** Short summary copy, e.g. "7 identical images and 2 cloned accounts found" */
  summary: string;
  /** Max 3 items are shown; remainder rolls into the View-All footer */
  directClones: NetworkEntity[];
  /** Max 5 items are shown; remainder rolls into the View-All footer */
  suspiciousLinks: NetworkEntity[];
  /** Total related entities across the entire cluster */
  totalRelated: number;
  onBulkEnforce?: (ids: string[]) => void;
  onApprove?: (id: string) => void;
  onEnforce?: (id: string) => void;
  onViewAll?: () => void;
}

const ENTITY_META: Record<
  NetworkEntityKind,
  { icon: RemixiconComponentType; label: string }
> = {
  image: { icon: RiImage2Line, label: "Image" },
  post: { icon: RiFileTextLine, label: "Post" },
  website: { icon: RiGlobalLine, label: "Website" },
  account: { icon: RiUserLine, label: "Account" },
  seller: { icon: RiUserLine, label: "Seller" },
};

const DIRECT_CLONE_CAP = 3;
const SUSPICIOUS_CAP = 5;

export function NetworkTab({
  clusterLabel,
  summary,
  directClones,
  suspiciousLinks,
  totalRelated,
  onBulkEnforce,
  onApprove,
  onEnforce,
  onViewAll,
}: NetworkTabProps) {
  const shownClones = directClones.slice(0, DIRECT_CLONE_CAP);
  const shownSuspicious = suspiciousLinks.slice(0, SUSPICIOUS_CAP);
  const bulkCount = directClones.length + suspiciousLinks.length;
  const bulkIds = [...directClones, ...suspiciousLinks].map((e) => e.id);

  return (
    <div className="flex flex-col gap-5">
      {/* ── 1. Blast Radius Action Zone ── */}
      <Card className="bg-primary/5 ring-2 ring-primary/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <RiFlashlightLine className="size-4" />
            </span>
            <CardTitle className="text-sm font-semibold">
              High-Confidence Network
            </CardTitle>
            <Badge variant="outline" className="ml-auto gap-1 text-[11px]">
              <RiNodeTree className="size-3" />
              Propagate Action
            </Badge>
          </div>
          <CardDescription className="pt-1">{summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onBulkEnforce?.(bulkIds)}
              disabled={bulkCount === 0}
            >
              <RiHammerLine />
              Bulk Enforce ({bulkCount})
            </Button>
            <Badge variant="destructive" className="gap-1">
              <RiShieldCrossLine className="size-3" />
              {clusterLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ── 2A. Direct Clones ── */}
      <Section
        icon={RiCheckLine}
        title="Direct Clones"
        hint="Auto-selected"
        count={directClones.length}
      >
        {shownClones.length === 0 ? (
          <EmptyRow label="No direct clones detected" />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {shownClones.map((entity) => (
              <EntityRow
                key={entity.id}
                entity={entity}
                onApprove={onApprove}
                onEnforce={onEnforce}
              />
            ))}
          </ul>
        )}
      </Section>

      {/* ── 2B. Suspicious Links ── */}
      <Section
        icon={RiAlertLine}
        title="Suspicious Links"
        hint="Review needed"
        count={suspiciousLinks.length}
      >
        {shownSuspicious.length === 0 ? (
          <EmptyRow label="No suspicious links pending review" />
        ) : (
          <ul className="flex flex-col gap-1.5">
            {shownSuspicious.map((entity) => (
              <EntityRow
                key={entity.id}
                entity={entity}
                onApprove={onApprove}
                onEnforce={onEnforce}
              />
            ))}
          </ul>
        )}
      </Section>

      {/* ── 3. View-All Footer ── */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onViewAll}
        disabled={!totalRelated}
      >
        View all {totalRelated} related entities
      </Button>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({
  icon: Icon,
  title,
  hint,
  count,
  children,
}: {
  icon: RemixiconComponentType;
  title: string;
  hint: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h4>
        <span className="text-xs font-normal text-muted-foreground">
          {hint}
        </span>
        <Badge variant="secondary" className="ml-auto font-mono tabular-nums">
          {count}
        </Badge>
      </div>
      <Separator />
      {children}
    </section>
  );
}

/* ─── Entity row ─── */
function EntityRow({
  entity,
  onApprove,
  onEnforce,
}: {
  entity: NetworkEntity;
  onApprove?: (id: string) => void;
  onEnforce?: (id: string) => void;
}) {
  const meta = ENTITY_META[entity.kind];
  const Icon = meta.icon;

  return (
    <li className="group flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 transition-colors hover:bg-muted/60">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        {entity.href ? (
          <Link
            href={entity.href}
            className="block truncate text-xs font-medium text-foreground hover:text-primary hover:underline"
          >
            {entity.name}
          </Link>
        ) : (
          <p className="truncate text-xs font-medium text-foreground">
            {entity.name}
          </p>
        )}
        <p className="truncate text-[11px] text-muted-foreground">
          {meta.label}
          {entity.subtitle ? ` · ${entity.subtitle}` : ""}
        </p>
      </div>

      <RiskBadge score={entity.riskScore} />

      <ButtonGroup className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Quick approve"
              onClick={() => onApprove?.(entity.id)}
            >
              <RiCheckLine />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Quick approve</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Quick enforce"
              onClick={() => onEnforce?.(entity.id)}
            >
              <RiHammerLine />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Quick enforce</TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </li>
  );
}

function RiskBadge({ score }: { score: number }) {
  const variant =
    score >= 80 ? "destructive" : score >= 50 ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="font-mono tabular-nums">
      {score}
    </Badge>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-dashed border-border px-3 py-2 text-center text-xs text-muted-foreground">
      {label}
    </p>
  );
}
