"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiFileTextLine,
  RiFilter3Line,
  RiFlashlightLine,
  RiGlobalLine,
  RiHammerLine,
  RiImage2Line,
  RiListCheck3,
  RiNodeTree,
  RiSearchLine,
  RiShieldCrossLine,
  RiUserLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { create } from "zustand";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
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
  riskScore: number;
  href?: string;
}

export interface NetworkTabProps {
  clusterLabel: string;
  summary: string;
  directClones: NetworkEntity[];
  suspiciousLinks: NetworkEntity[];
  relatedEntities?: NetworkEntity[];
  totalRelated: number;
  onBulkEnforce?: (ids: string[]) => void;
  onApprove?: (id: string) => void;
  onEnforce?: (id: string) => void;
  onViewAll?: () => void;
  onBatchSubmit?: (ids: string[], action: string, notes: string) => void;
  /** Short context label shown in the sub-batch sheet (e.g. "WEB#81 network") */
  contextLabel?: string;
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

const CATEGORY_ORDER: NetworkEntityKind[] = [
  "website",
  "image",
  "post",
  "account",
  "seller",
];

const CATEGORY_LABEL: Record<NetworkEntityKind, string> = {
  website: "Related Websites",
  image: "Related Images",
  post: "Related Posts",
  account: "Related Accounts",
  seller: "Related Sellers",
};

const DIRECT_CLONE_CAP = 3;
const SUSPICIOUS_CAP = 5;
const LOAD_MORE_INCREMENT = 20;

interface NetworkSelectionStore {
  checked: Set<string>;
  isSheetOpen: boolean;
  toggle: (id: string) => void;
  clear: () => void;
  setSheetOpen: (open: boolean) => void;
}

const useSelectionStore = create<NetworkSelectionStore>((set) => ({
  checked: new Set(),
  isSheetOpen: false,
  toggle: (id) =>
    set((state) => {
      const next = new Set(state.checked);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { checked: next };
    }),
  clear: () => set({ checked: new Set() }),
  setSheetOpen: (open) => set({ isSheetOpen: open }),
}));

export function NetworkTab({
  clusterLabel,
  summary,
  directClones,
  suspiciousLinks,
  relatedEntities = [],
  totalRelated,
  onBulkEnforce,
  onApprove,
  onEnforce,
  onViewAll,
  onBatchSubmit,
  contextLabel,
}: NetworkTabProps) {
  const shownClones = directClones.slice(0, DIRECT_CLONE_CAP);
  const shownSuspicious = suspiciousLinks.slice(0, SUSPICIOUS_CAP);
  const bulkCount = directClones.length + suspiciousLinks.length;
  const bulkIds = [...directClones, ...suspiciousLinks].map((e) => e.id);

  const checked = useSelectionStore((s) => s.checked);
  const clear = useSelectionStore((s) => s.clear);
  const isSheetOpen = useSelectionStore((s) => s.isSheetOpen);
  const setSheetOpen = useSelectionStore((s) => s.setSheetOpen);

  const byKind = useMemo(() => {
    const map = new Map<NetworkEntityKind, NetworkEntity[]>();
    for (const entity of relatedEntities) {
      const list = map.get(entity.kind) ?? [];
      list.push(entity);
      map.set(entity.kind, list);
    }
    return map;
  }, [relatedEntities]);

  const populatedCategories = CATEGORY_ORDER.filter((kind) =>
    byKind.has(kind)
  );
  const defaultOpen = populatedCategories.slice(0, 3);

  const checkedEntities = useMemo(
    () => relatedEntities.filter((e) => checked.has(e.id)),
    [relatedEntities, checked]
  );

  return (
    <>
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

        {/* ── 3. Related Entities (Tables / Accordion) ── */}
        {populatedCategories.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <RiNodeTree className="size-3.5 text-muted-foreground" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Related Entities
              </h4>
              <span className="text-xs font-normal text-muted-foreground">
                Select to batch
              </span>
              <Badge
                variant="secondary"
                className="ml-auto font-mono tabular-nums"
              >
                {relatedEntities.length}
              </Badge>
            </div>
            <Separator />
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <Accordion type="multiple" defaultValue={defaultOpen}>
                {populatedCategories.map((kind, idx) => (
                  <RelatedCategory
                    key={kind}
                    kind={kind}
                    entities={byKind.get(kind) ?? []}
                    isLast={idx === populatedCategories.length - 1}
                  />
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* ── 4. View-All Footer ── */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onViewAll}
          disabled={!totalRelated}
        >
          View all {totalRelated} related entities
        </Button>
      </div>

      {/* ── 5. Floating Batch Tray (portal-like fixed overlay) ── */}
      {checked.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-foreground text-background px-4 py-2 shadow-2xl">
          <RiListCheck3 className="size-4 opacity-70" />
          <span className="text-sm font-medium whitespace-nowrap">
            {checked.size} selected
          </span>
          <Separator orientation="vertical" className="h-5 bg-background/20" />
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs font-semibold"
            onClick={() => setSheetOpen(true)}
          >
            Create Sub-Batch
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-background/70 hover:bg-background/10 hover:text-background"
            onClick={clear}
          >
            <RiCloseLine className="size-3.5" />
          </Button>
        </div>
      )}

      {/* ── 6. Sub-Batch Sheet ── */}
      <SubBatchSheet
        open={isSheetOpen}
        onOpenChange={setSheetOpen}
        entities={checkedEntities}
        contextLabel={contextLabel}
        onSubmit={(action, notes) => {
          onBatchSubmit?.(
            checkedEntities.map((e) => e.id),
            action,
            notes
          );
          clear();
          setSheetOpen(false);
        }}
      />
    </>
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

/* ─── Related Category (accordion section with selectable rows) ─── */
function RelatedCategory({
  kind,
  entities,
  isLast,
}: {
  kind: NetworkEntityKind;
  entities: NetworkEntity[];
  isLast: boolean;
}) {
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(LOAD_MORE_INCREMENT);
  const [filters, setFilters] = useState({ high: false, med: false, low: false });

  const hasActiveFilter = Object.values(filters).some(Boolean);

  const filtered = useMemo(() => {
    return entities.filter((e) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        (e.subtitle?.toLowerCase().includes(q) ?? false);
      if (!matchesSearch) return false;
      if (!hasActiveFilter) return true;
      const high = e.riskScore >= 80;
      const med = e.riskScore >= 50 && e.riskScore < 80;
      const low = e.riskScore < 50;
      return (filters.high && high) || (filters.med && med) || (filters.low && low);
    });
  }, [entities, search, filters, hasActiveFilter]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - visible;
  const label = CATEGORY_LABEL[kind];

  return (
    <AccordionItem
      value={kind}
      className={isLast ? "border-b-0" : ""}
    >
      <AccordionTrigger className="px-3 py-2.5 text-xs font-semibold text-foreground hover:no-underline hover:bg-muted/60">
        {label} ({filtered.length})
      </AccordionTrigger>
      <AccordionContent className="pt-0 pb-2">
        {entities.length > 10 && (
          <div className="flex items-center gap-2 px-3 pb-2">
            <div className="relative flex-1">
              <RiSearchLine className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(LOAD_MORE_INCREMENT);
                }}
                placeholder={`Search ${entities.length} ${label.toLowerCase()}…`}
                className="h-7 pl-7 text-xs"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative size-7 shrink-0"
                >
                  <RiFilter3Line className="size-3.5" />
                  {hasActiveFilter && (
                    <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-3">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                    Filter by Risk
                  </h4>
                  <div className="space-y-2.5">
                    <RiskFilterRow
                      id={`${kind}-high`}
                      checked={filters.high}
                      onChange={(c) => setFilters((p) => ({ ...p, high: c }))}
                      label="High Risk (80-100)"
                      variant="destructive"
                    />
                    <RiskFilterRow
                      id={`${kind}-med`}
                      checked={filters.med}
                      onChange={(c) => setFilters((p) => ({ ...p, med: c }))}
                      label="Medium Risk (50-79)"
                      variant="secondary"
                    />
                    <RiskFilterRow
                      id={`${kind}-low`}
                      checked={filters.low}
                      onChange={(c) => setFilters((p) => ({ ...p, low: c }))}
                      label="Low Risk (0-49)"
                      variant="outline"
                    />
                  </div>
                  {hasActiveFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-[10px]"
                      onClick={() => setFilters({ high: false, med: false, low: false })}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex flex-col">
          {shown.map((entity) => (
            <SelectableRow key={entity.id} entity={entity} />
          ))}
        </div>

        {remaining > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-primary hover:text-primary"
            onClick={() => setVisible((c) => c + LOAD_MORE_INCREMENT)}
          >
            Show {Math.min(remaining, LOAD_MORE_INCREMENT)} more…
          </Button>
        )}

        {(search || hasActiveFilter) && filtered.length === 0 && (
          <p className="px-4 py-3 text-center text-[10px] text-muted-foreground">
            No matches found
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function RiskFilterRow({
  id,
  checked,
  onChange,
  label,
  variant,
}: {
  id: string;
  checked: boolean;
  onChange: (c: boolean) => void;
  label: string;
  variant: "destructive" | "secondary" | "outline";
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(!!c)}
        className="size-3.5"
      />
      <Label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium">
        <Badge variant={variant} className="size-2 rounded-full p-0" />
        {label}
      </Label>
    </div>
  );
}

function SelectableRow({ entity }: { entity: NetworkEntity }) {
  const meta = ENTITY_META[entity.kind];
  const Icon = meta.icon;
  const checked = useSelectionStore((s) => s.checked);
  const toggle = useSelectionStore((s) => s.toggle);
  const isChecked = checked.has(entity.id);

  return (
    <div
      className={`flex items-center gap-3 border-b border-border px-3 py-2 transition-colors last:border-b-0 ${
        isChecked ? "bg-primary/5" : "hover:bg-muted/60"
      }`}
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={() => toggle(entity.id)}
        className="size-3.5"
        aria-label={`Select ${entity.name}`}
      />

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
          <p className="truncate text-xs font-medium text-foreground">{entity.name}</p>
        )}
        <p className="truncate text-[11px] text-muted-foreground">
          {entity.id}
          {entity.subtitle ? ` · ${entity.subtitle}` : ""}
        </p>
      </div>

      <RiskBadge score={entity.riskScore} />
    </div>
  );
}

/* ─── Sub-Batch Sheet ─── */
function SubBatchSheet({
  open,
  onOpenChange,
  entities,
  contextLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  entities: NetworkEntity[];
  contextLabel?: string;
  onSubmit: (action: string, notes: string) => void;
}) {
  const [action, setAction] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = () => {
    if (!action) return;
    onSubmit(action, notes);
    setAction("");
    setNotes("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-[600px] flex-col p-0 sm:max-w-[600px]">
        <SheetHeader className="shrink-0 border-b border-border px-6 py-5">
          <SheetTitle className="text-base font-bold">Sub-Batch Workflow</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Processing {entities.length} entities
            {contextLabel ? ` from ${contextLabel}` : ""}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 px-6 py-5">
            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RiNodeTree className="size-3.5 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Selected Entities
                </h4>
                <Badge variant="secondary" className="ml-auto font-mono tabular-nums">
                  {entities.length}
                </Badge>
              </div>
              <Separator />
              <div className="flex flex-col gap-1">
                {entities.map((entity) => {
                  const meta = ENTITY_META[entity.kind];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={entity.id}
                      className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5"
                    >
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">
                          {entity.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {entity.id}
                        </p>
                      </div>
                      <RiskBadge score={entity.riskScore} />
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RiAlertLine className="size-3.5 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Batch Action
                </h4>
              </div>
              <Separator />
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select action…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="counterfeit" className="text-xs">
                    Mark as Counterfeit
                  </SelectItem>
                  <SelectItem value="takedown" className="text-xs">
                    Send Takedown Notice
                  </SelectItem>
                  <SelectItem value="escalate" className="text-xs">
                    Escalate to Legal
                  </SelectItem>
                  <SelectItem value="archive" className="text-xs">
                    Archive
                  </SelectItem>
                </SelectContent>
              </Select>
            </section>

            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RiFileTextLine className="size-3.5 text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Notes
                </h4>
              </div>
              <Separator />
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context for this batch action…"
                className="h-24 resize-none text-xs"
              />
            </section>
          </div>
        </ScrollArea>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={!action} onClick={handleSubmit}>
            Execute Batch
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
