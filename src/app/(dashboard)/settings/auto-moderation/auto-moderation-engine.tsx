"use client";

import { useState } from "react";
import {
  RiAddLine,
  RiPlayCircleLine,
  RiMagicLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertFill,
  RiDeleteBinLine,
  RiNodeTree,
  RiPencilLine,
  RiMoreLine,
} from "@remixicon/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/* ─── Types ─── */

interface Rule {
  id: string;
  name: string;
  triggerLabel: string;
  conditionsCount: number;
  hitRate: number | null;
  status: "active" | "paused";
  conflicts: number;
}

/* ─── Mock Data ─── */

const INITIAL_RULES: Rule[] = [
  {
    id: "rule_99",
    name: "Known Scam Signature",
    triggerLabel: "Counterfeit",
    conditionsCount: 3,
    hitRate: 94,
    status: "active",
    conflicts: 2,
  },
  {
    id: "rule_88",
    name: "Counterfeit Image + Low Price",
    triggerLabel: "Counterfeit",
    conditionsCount: 3,
    hitRate: 87,
    status: "active",
    conflicts: 5,
  },
  {
    id: "rule_34",
    name: "Luxury Keyword Density",
    triggerLabel: "Suspicious",
    conditionsCount: 4,
    hitRate: 73,
    status: "active",
    conflicts: 8,
  },
  {
    id: "rule_56",
    name: "Cloned Site Template",
    triggerLabel: "Counterfeit",
    conditionsCount: 4,
    hitRate: 68,
    status: "paused",
    conflicts: 12,
  },
  {
    id: "rule_12",
    name: "High-Risk Geo + New Domain",
    triggerLabel: "Suspicious",
    conditionsCount: 3,
    hitRate: 42,
    status: "active",
    conflicts: 21,
  },
  {
    id: "rule_71",
    name: "Suspicious Payment Flow",
    triggerLabel: "Scam",
    conditionsCount: 4,
    hitRate: 61,
    status: "active",
    conflicts: 9,
  },
];

const FIELD_OPTIONS = [
  "Risk Score",
  "Geo",
  "Registrar",
  "Domain Age",
  "Keyword Density",
  "Image Match Score",
  "Price Variance",
  "SSL Certificate Age",
  "Traffic Volume",
];

const OPERATOR_OPTIONS = [
  "Equals",
  "Not Equals",
  "Greater than",
  "Less than",
  "Contains",
  "Does not contain",
];

const LABEL_OPTIONS = [
  "Counterfeit",
  "Scam",
  "Suspicious",
  "Phishing",
  "Authorized",
];

const MOCK_SIMULATION = {
  entityId: "WEB#81",
  results: [
    {
      id: "rule_99",
      name: "Known Scam Signature",
      matchPercentage: 100,
      conditions: [
        { name: "Image hash matches known scam DB", passed: true },
        { name: "Price variance > 80%", passed: true },
        { name: "Domain flagged in threat intel feed", passed: true },
      ],
      decision: "Auto-Reject" as const,
    },
    {
      id: "rule_88",
      name: "Counterfeit Image + Low Price",
      matchPercentage: 98,
      conditions: [
        { name: "Image recognized as Counterfeit", passed: true },
        { name: "Brand matches premium list", passed: true },
        { name: "Price is below 20% of retail", passed: false },
      ],
      decision: "No Action" as const,
    },
    {
      id: "rule_34",
      name: "Luxury Keyword Density",
      matchPercentage: 91,
      conditions: [
        { name: "Page contains > 5 luxury brand names", passed: true },
        { name: "Keyword density exceeds 8% threshold", passed: true },
        { name: "No official retailer certificate found", passed: true },
        {
          name: "Domain registered to brand-authorized entity",
          passed: false,
        },
      ],
      decision: "No Action" as const,
    },
    {
      id: "rule_56",
      name: "Cloned Site Template",
      matchPercentage: 85,
      conditions: [
        { name: "DOM structure matches known clone template", passed: true },
        { name: "Favicon fingerprint matches flagged set", passed: true },
        { name: "SSL certificate issued within 7 days", passed: false },
        { name: "Hosting provider on watchlist", passed: true },
      ],
      decision: "No Action" as const,
    },
  ],
};

const INSIGHTS_RULES = [
  {
    id: "rule_12",
    name: "High-Risk Geo + New Domain",
    hitRate: 42,
    falsePositiveRate: 38,
    issue: "High false-positive rate on legitimate new businesses from flagged regions.",
  },
  {
    id: "rule_56",
    name: "Cloned Site Template",
    hitRate: 68,
    falsePositiveRate: 22,
    issue: "Template matching catches white-label resellers using shared themes.",
  },
];

/* ─── Condition Row Type ─── */

interface ConditionRow {
  id: number;
  field: string;
  operator: string;
  value: string;
  logic: "AND" | "OR";
}

/* ─── Rule Builder ─── */

interface RuleBuilderProps {
  onSave: (rule: {
    name: string;
    conditionsCount: number;
    actionLabel: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    actionLabel: string;
    conditionsCount: number;
  };
}

function RuleBuilder({ onSave, onCancel, initialData }: RuleBuilderProps) {
  const [ruleName, setRuleName] = useState(initialData?.name ?? "");
  const [conditions, setConditions] = useState<ConditionRow[]>(
    initialData
      ? Array.from({ length: initialData.conditionsCount }, (_, i) => ({
          id: i + 1,
          field: "",
          operator: "",
          value: "",
          logic: "AND" as const,
        }))
      : [{ id: 1, field: "", operator: "", value: "", logic: "AND" }]
  );
  const [actionLabel, setActionLabel] = useState(
    initialData?.actionLabel ?? ""
  );

  const addCondition = (logic: "AND" | "OR") => {
    setConditions((prev) => [
      ...prev,
      { id: Date.now(), field: "", operator: "", value: "", logic },
    ]);
  };

  const removeCondition = (id: number) => {
    if (conditions.length > 1) {
      setConditions((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const updateCondition = (
    id: number,
    key: keyof ConditionRow,
    value: string
  ) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: value } : c))
    );
  };

  const handleSave = () => {
    if (!ruleName.trim()) {
      toast.error("Please enter a rule name.");
      return;
    }
    if (!conditions[0].field) {
      toast.error("Please configure at least one condition.");
      return;
    }
    if (!actionLabel) {
      toast.error("Please select an action label.");
      return;
    }
    onSave({
      name: ruleName.trim(),
      conditionsCount: conditions.length,
      actionLabel,
    });
  };

  return (
    <>
      {/* Scrollable Form Body */}
      <div className="max-h-[65vh] overflow-y-auto p-6 space-y-8 bg-card">
        {/* Rule Name */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">
            Rule Name
          </Label>
          <Input
            placeholder="e.g., Reject counterfeit luxury goods"
            className="bg-card max-w-lg"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
          />
        </div>

        {/* Conditions (IF) */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Conditions
          </Label>

          <div className="bg-accent border border-border rounded-xl p-5 space-y-4 shadow-sm">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="flex items-center gap-3">
                <div className="w-8 text-[11px] font-bold text-muted-foreground text-center tracking-wider shrink-0">
                  {index === 0 ? "IF" : condition.logic}
                </div>

                <Select
                  value={condition.field}
                  onValueChange={(v) =>
                    updateCondition(condition.id, "field", v)
                  }
                >
                  <SelectTrigger className="h-9 w-[180px] shrink-0 text-xs bg-card">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f} className="text-xs">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={condition.operator}
                  onValueChange={(v) =>
                    updateCondition(condition.id, "operator", v)
                  }
                >
                  <SelectTrigger className="h-9 w-[150px] shrink-0 text-xs bg-card">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATOR_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o} className="text-xs">
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex-1 min-w-0">
                  <Input
                    placeholder="Value..."
                    className="h-9 w-full text-xs bg-card"
                    value={condition.value}
                    onChange={(e) =>
                      updateCondition(condition.id, "value", e.target.value)
                    }
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCondition(condition.id)}
                  disabled={conditions.length === 1}
                >
                  <RiDeleteBinLine className="size-4" />
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-2 pl-11 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-dashed text-foreground gap-1"
                onClick={() => addCondition("AND")}
              >
                <RiAddLine className="size-3" /> AND
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-dashed text-foreground gap-1"
                onClick={() => addCondition("OR")}
              >
                <RiAddLine className="size-3" /> OR
              </Button>
            </div>
          </div>
        </div>

        {/* Action (THEN) */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">
            Action
          </Label>
          <div className="bg-primary/50 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
            <div className="w-8 text-[11px] font-bold text-primary text-center tracking-wider shrink-0">
              THEN
            </div>
            <div className="flex-1 flex items-center gap-3">
              <span className="text-sm text-foreground whitespace-nowrap">
                Apply label:
              </span>
              <Select value={actionLabel} onValueChange={setActionLabel}>
                <SelectTrigger className="w-[200px] text-xs bg-card border-primary/30 focus:ring-ring">
                  <SelectValue placeholder="Select label…" />
                </SelectTrigger>
                <SelectContent>
                  {LABEL_OPTIONS.map((l) => (
                    <SelectItem key={l} value={l} className="text-xs">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-accent shrink-0">
        <DialogFooter className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            className="text-foreground"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="bg-foreground text-primary-foreground hover:bg-foreground/90 px-6"
            onClick={handleSave}
          >
            Save Rule
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}

/* ─── Simulation Results ─── */

function SimulationResults({
  results,
}: {
  results: typeof MOCK_SIMULATION.results;
}) {
  return (
    <div className="space-y-3 mt-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Evaluation Trace
      </p>
      {results.map((rule, index) => {
        const isFullMatch = rule.matchPercentage === 100;
        const firstFailed = rule.conditions.find((c) => !c.passed);

        return (
          <div
            key={rule.id}
            className="border border-border rounded-lg overflow-hidden bg-card"
          >
            <div className="px-4 py-3 border-b border-border space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    <span className="text-muted-foreground mr-2">#{index + 1}</span>
                    {rule.name}
                  </span>
                  {isFullMatch ? (
                    <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
                      <RiCheckLine className="size-3" /> Full match —{" "}
                      {rule.decision}
                    </p>
                  ) : firstFailed ? (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Failed on:{" "}
                      <span className="font-medium text-foreground">
                        {firstFailed.name}
                      </span>
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg font-bold text-foreground">
                    {rule.matchPercentage}%
                  </span>
                  <Badge
                    variant={isFullMatch ? "default" : "secondary"}
                    className={`text-[10px] ${
                      isFullMatch
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : ""
                    }`}
                  >
                    {rule.decision}
                  </Badge>
                </div>
              </div>
              <Progress
                value={rule.matchPercentage}
                className={`h-1.5 ${
                  isFullMatch
                    ? "bg-emerald-100 [&>div]:bg-emerald-500"
                    : "bg-secondary"
                }`}
              />
            </div>

            <div className="p-4 space-y-1.5">
              {rule.conditions.map((condition, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm ${
                    condition.passed
                      ? "text-foreground"
                      : "bg-destructive/10 border border-red-100 text-red-900 font-semibold"
                  }`}
                >
                  {condition.passed ? (
                    <RiCheckLine className="size-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="bg-destructive/15 rounded-full p-0.5 shrink-0">
                      <RiCloseLine className="size-2.5 text-destructive" />
                    </div>
                  )}
                  {condition.name}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ─── */

export function AutoModerationEngine() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [simulationEntityId, setSimulationEntityId] = useState("");
  const [simulationRan, setSimulationRan] = useState(false);

  const handleSaveRule = (data: {
    name: string;
    conditionsCount: number;
    actionLabel: string;
  }) => {
    if (editingRule) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? {
                ...r,
                name: data.name,
                triggerLabel: data.actionLabel,
                conditionsCount: data.conditionsCount,
              }
            : r
        )
      );
      setIsBuilderOpen(false);
      setEditingRule(null);
      toast.success("Rule updated successfully.");
    } else {
      const newRule: Rule = {
        id: `rule_${Math.floor(Math.random() * 9000) + 1000}`,
        name: data.name,
        triggerLabel: data.actionLabel,
        conditionsCount: data.conditionsCount,
        hitRate: null,
        status: "active",
        conflicts: 0,
      };
      setRules((prev) => [newRule, ...prev]);
      setIsBuilderOpen(false);
      toast.success("Rule created and activated successfully.");
    }
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setIsBuilderOpen(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    toast.success("Rule deleted.");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-accent overflow-auto">
      <div className="px-8 pt-8 pb-2">
        <h1 className="text-xl font-bold text-foreground">
          Auto-Moderation Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage cascading rules, simulate outcomes, and optimize performance.
        </p>
      </div>

      <Tabs defaultValue="library" className="flex-1 flex flex-col px-8 pb-8">
        <TabsList className="bg-card border border-border h-10 w-fit">
          <TabsTrigger value="library" className="text-xs">
            Rules Library
          </TabsTrigger>
          <TabsTrigger value="simulator" className="text-xs">
            Rule Simulator
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs">
            Insights & Optimization
          </TabsTrigger>
        </TabsList>

        {/* ── LIBRARY & BUILDER ── */}
        <TabsContent value="library" className="space-y-4 pt-4 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-foreground">
              Active Rules
            </h2>
            <Dialog
              open={isBuilderOpen}
              onOpenChange={(open) => {
                setIsBuilderOpen(open);
                if (!open) setEditingRule(null);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2 bg-foreground text-primary-foreground hover:bg-foreground/90"
                >
                  <RiAddLine className="size-3.5" /> Create Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-card shadow-2xl">
                <div className="p-6 border-b border-border bg-card shrink-0">
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {editingRule ? "Edit Rule" : "Rule Builder"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {editingRule
                        ? "Update the conditions and action for this rule."
                        : "Define cascading conditions and the label to apply when all conditions match."}
                    </DialogDescription>
                  </DialogHeader>
                </div>
                {isBuilderOpen && (
                  <RuleBuilder
                    onSave={handleSaveRule}
                    onCancel={() => {
                      setIsBuilderOpen(false);
                      setEditingRule(null);
                    }}
                    initialData={
                      editingRule
                        ? {
                            name: editingRule.name,
                            actionLabel: editingRule.triggerLabel,
                            conditionsCount: editingRule.conditionsCount,
                          }
                        : undefined
                    }
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-10">
                    Rule Name
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-10">
                    Conditions
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-10">
                    Label
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-10">
                    Hit Rate
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-10">
                    Conflicts
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-10 text-right">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-10 w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} className="group">
                    <TableCell className="text-sm font-medium text-foreground py-3">
                      <div className="flex items-center gap-2">
                        <RiNodeTree className="size-3.5 text-muted-foreground" />
                        {rule.name}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs text-muted-foreground">
                        {rule.conditionsCount} condition
                        {rule.conditionsCount !== 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium"
                      >
                        {rule.triggerLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      {rule.hitRate !== null ? (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={rule.hitRate}
                            className="h-1.5 w-16 bg-secondary"
                          />
                          <span className="text-xs text-foreground font-medium tabular-nums">
                            {rule.hitRate}%
                          </span>
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-primary/10 text-primary"
                        >
                          New
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={`text-xs font-medium tabular-nums ${
                          rule.conflicts > 15
                            ? "text-destructive"
                            : rule.conflicts > 8
                            ? "text-amber-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        {rule.conflicts}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={`text-[11px] font-medium ${
                            rule.status === "active"
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {rule.status === "active" ? "Active" : "Paused"}
                        </span>
                        <Switch
                          checked={rule.status === "active"}
                          className="scale-75"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-3 w-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <RiMoreLine className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="text-xs gap-2"
                            onClick={() => handleEditRule(rule)}
                          >
                            <RiPencilLine className="size-3.5" />
                            Edit Rule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-xs gap-2 text-destructive focus:text-destructive"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <RiDeleteBinLine className="size-3.5" />
                            Delete Rule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {rules.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-sm text-muted-foreground"
                    >
                      No rules found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── SIMULATOR ── */}
        <TabsContent value="simulator" className="space-y-4 pt-4 flex-1">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <RiPlayCircleLine className="size-4 text-muted-foreground" />
                Trace Entity ID
              </CardTitle>
              <CardDescription className="text-xs">
                Enter an entity ID to see how the current rule engine evaluates
                it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 max-w-md">
                <Input
                  placeholder="e.g., WEB#81"
                  className="h-9 text-xs"
                  value={simulationEntityId}
                  onChange={(e) => setSimulationEntityId(e.target.value)}
                />
                <Button
                  size="sm"
                  className="gap-2 bg-foreground text-primary-foreground hover:bg-foreground/90 h-9"
                  onClick={() => setSimulationRan(true)}
                >
                  <RiPlayCircleLine className="size-3.5" /> Simulate
                </Button>
              </div>

              {simulationRan && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-emerald-100 text-emerald-700"
                    >
                      Simulation Complete
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Entity{" "}
                      <span className="font-medium text-foreground">
                        {simulationEntityId || MOCK_SIMULATION.entityId}
                      </span>{" "}
                      evaluated against {MOCK_SIMULATION.results.length} rules
                    </span>
                  </div>
                  <SimulationResults results={MOCK_SIMULATION.results} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── INSIGHTS ── */}
        <TabsContent value="insights" className="space-y-4 pt-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Underperforming Rules */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <RiAlertFill className="size-4 text-destructive" />
                  <span className="text-destructive">Needs Attention</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Rules with high false-positive rates or low accuracy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {INSIGHTS_RULES.map((rule) => (
                  <div
                    key={rule.id}
                    className="border border-border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {rule.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-destructive/15 text-destructive shrink-0"
                      >
                        {rule.falsePositiveRate}% FP
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={rule.hitRate}
                        className="h-1.5 flex-1 bg-secondary"
                      />
                      <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                        {rule.hitRate}% hits
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {rule.issue}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <RiMagicLine className="size-4" />
                  Cortex AI Suggestions
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated recommendations to improve rule accuracy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-primary/30 rounded-lg p-3 bg-background space-y-2">
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong>Rule #12 (High-Risk Geo + New Domain)</strong> has a
                    38% false-positive rate. Adding the condition{" "}
                    <code className="text-xs bg-primary/15 px-1.5 py-0.5 rounded text-primary">
                      Traffic &gt; 10k/mo
                    </code>{" "}
                    could improve accuracy by an estimated 14%.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <RiAddLine className="size-3" /> Apply Suggestion
                  </Button>
                </div>

                <div className="border border-primary/30 rounded-lg p-3 bg-background space-y-2">
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong>Rule #56 (Cloned Site Template)</strong> is
                    currently paused. Reactivating with an additional{" "}
                    <code className="text-xs bg-primary/15 px-1.5 py-0.5 rounded text-primary">
                      Domain Age &lt; 90 days
                    </code>{" "}
                    filter would reduce false positives by 19%.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <RiAddLine className="size-3" /> Apply Suggestion
                  </Button>
                </div>

                <div className="border border-primary/30 rounded-lg p-3 bg-background space-y-2">
                  <p className="text-sm text-foreground leading-relaxed">
                    Rules <strong>#88</strong> and <strong>#34</strong> overlap
                    on 3 conditions. Consider merging into a single rule with OR
                    logic to reduce evaluation time by ~40ms per entity.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <RiMagicLine className="size-3" /> Review Merge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
