"use client";

import { useState, useEffect, useCallback } from "react";
import {
  RiCloseLine,
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowDownSLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";

// ── Types ──

type LogicalOperator = "AND" | "OR";

type RuleOperator =
  | "is"
  | "is not"
  | "contains"
  | "does not contain"
  | "greater than"
  | "less than"
  | "is empty"
  | "is not empty";

interface FilterRule {
  id: string;
  field: string;
  operator: RuleOperator;
  value: string;
}

interface FilterQuery {
  logicalOperator: LogicalOperator;
  rules: FilterRule[];
}

// ── Field Definitions ──

type FieldType = "enum" | "number" | "text" | "date";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

const FIELDS: FieldDef[] = [
  { key: "label", label: "Label", type: "enum", options: ["Legitimate", "Suspicious", "Counterfeit", "Unlabeled"] },
  { key: "moderation_status", label: "Moderation Status", type: "enum", options: ["Un-moderated", "Moderated", "Checked", "Validated"] },
  { key: "takedown_status", label: "Takedown Status", type: "enum", options: ["Pending", "Success", "Failed", "Not Requested"] },
  { key: "product_category", label: "Product Category", type: "enum", options: ["Handbags", "Watches", "Electronics", "Footwear", "Fragrances", "Accessories", "Apparel"] },
  { key: "channel", label: "Channel", type: "enum", options: ["Marketplace", "Social Commerce", "Independent Store", "Authorized Dealer"] },
  { key: "enforcement", label: "Enforcement", type: "enum", options: ["DMCA Filed", "C&D Sent", "Platform Report", "No Action"] },
  { key: "account", label: "Account", type: "enum", options: ["Known Offender", "New Seller", "Verified", "Unknown"] },
  { key: "stock", label: "Stock", type: "enum", options: ["In Stock", "Low Stock", "Out of Stock"] },
  { key: "impact_score", label: "Impact Score", type: "number" },
  { key: "price", label: "Price", type: "number" },
  { key: "risk_score", label: "Risk Score", type: "number" },
  { key: "geo", label: "Estimated Geo", type: "text" },
  { key: "tags", label: "Tags", type: "text" },
  { key: "contact_info", label: "Contact Info", type: "enum", options: ["Available", "Missing", "Invalid"] },
];

const OPERATORS_BY_TYPE: Record<FieldType, RuleOperator[]> = {
  enum: ["is", "is not", "is empty", "is not empty"],
  number: ["is", "is not", "greater than", "less than", "is empty", "is not empty"],
  text: ["is", "is not", "contains", "does not contain", "is empty", "is not empty"],
  date: ["is", "is not", "greater than", "less than", "is empty", "is not empty"],
};

const UNARY_OPERATORS: RuleOperator[] = ["is empty", "is not empty"];

function getFieldDef(key: string): FieldDef | undefined {
  return FIELDS.find((f) => f.key === key);
}

let _ruleId = 0;
function nextRuleId(): string {
  return `rule-${++_ruleId}`;
}

function createBlankRule(): FilterRule {
  return { id: nextRuleId(), field: "label", operator: "is", value: "" };
}

// ── Sub-components ──

function FieldPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const def = getFieldDef(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 h-7 px-2 text-xs font-medium text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer whitespace-nowrap">
          {def?.label ?? "Select field"}
          <RiArrowDownSLine className="h-3 w-3 text-neutral-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search fields..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty>No field found.</CommandEmpty>
            <CommandGroup>
              {FIELDS.map((f) => (
                <CommandItem
                  key={f.key}
                  value={f.label}
                  onSelect={() => {
                    onChange(f.key);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  {f.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function OperatorPicker({
  fieldType,
  value,
  onChange,
}: {
  fieldType: FieldType;
  value: RuleOperator;
  onChange: (op: RuleOperator) => void;
}) {
  const [open, setOpen] = useState(false);
  const operators = OPERATORS_BY_TYPE[fieldType];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 h-7 px-2 text-xs text-neutral-500 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer whitespace-nowrap">
          {value}
          <RiArrowDownSLine className="h-3 w-3 text-neutral-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-1" align="start">
        {operators.map((op) => (
          <button
            key={op}
            onClick={() => {
              onChange(op);
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
              op === value
                ? "bg-neutral-100 font-medium text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {op}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function ValueInput({
  fieldDef,
  value,
  onChange,
}: {
  fieldDef: FieldDef;
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (fieldDef.type === "enum" && fieldDef.options) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1 h-7 px-2 text-xs rounded-md hover:bg-neutral-100 transition-colors cursor-pointer whitespace-nowrap max-w-[160px] truncate">
            <span className={value ? "font-medium text-neutral-900" : "text-neutral-400"}>
              {value || "Select..."}
            </span>
            <RiArrowDownSLine className="h-3 w-3 text-neutral-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." className="h-8 text-xs" />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {fieldDef.options.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={fieldDef.type === "number" ? "0" : "Value..."}
      type={fieldDef.type === "number" ? "number" : "text"}
      className="h-7 w-[120px] border-neutral-200 bg-transparent px-2 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-neutral-300"
    />
  );
}

// ── Main Component ──

interface AdvancedFilterBuilderProps {
  onSwitchToBasic: () => void;
}

export function AdvancedFilterBuilder({ onSwitchToBasic }: AdvancedFilterBuilderProps) {
  const [query, setQuery] = useState<FilterQuery>({
    logicalOperator: "AND",
    rules: [createBlankRule()],
  });

  const updateRule = useCallback(
    (ruleId: string, patch: Partial<FilterRule>) => {
      setQuery((prev) => ({
        ...prev,
        rules: prev.rules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)),
      }));
    },
    []
  );

  const removeRule = useCallback((ruleId: string) => {
    setQuery((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== ruleId),
    }));
  }, []);

  const addRule = useCallback(() => {
    setQuery((prev) => ({
      ...prev,
      rules: [...prev.rules, createBlankRule()],
    }));
  }, []);

  // Log query to console on change (mock filtering)
  useEffect(() => {
    console.log("[AdvancedFilter] query:", query);
  }, [query]);

  return (
    <div className="flex flex-col">
      {/* Header: Back + Logical Operator */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
        <button
          onClick={onSwitchToBasic}
          className="flex items-center gap-0.5 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <RiArrowLeftSLine className="h-3.5 w-3.5" />
          Basic Filters
        </button>
        <div className="flex items-center gap-1 text-[11px] text-neutral-500">
          <span>Match</span>
          <button
            onClick={() =>
              setQuery((prev) => ({
                ...prev,
                logicalOperator: prev.logicalOperator === "AND" ? "OR" : "AND",
              }))
            }
            className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-bold text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            {query.logicalOperator === "AND" ? "All" : "Any"}
          </button>
          <span>of the following</span>
        </div>
      </div>

      {/* Rules */}
      <div className="flex flex-col px-2 py-1.5">
        {query.rules.length === 0 && (
          <div className="px-3 py-4 text-center text-[11px] text-neutral-400">
            No filters applied. Add a filter below.
          </div>
        )}
        {query.rules.map((rule, idx) => {
          const fieldDef = getFieldDef(rule.field);
          const fieldType = fieldDef?.type ?? "text";
          const isUnary = UNARY_OPERATORS.includes(rule.operator);

          return (
            <div
              key={rule.id}
              className="group flex items-center gap-0.5 rounded-md px-1 py-0.5 hover:bg-neutral-50 transition-colors"
            >
              {/* Row connector label */}
              <span className="w-8 shrink-0 text-right text-[10px] font-medium uppercase text-neutral-300 select-none">
                {idx === 0 ? "Where" : query.logicalOperator === "AND" ? "and" : "or"}
              </span>

              {/* Field */}
              <FieldPicker
                value={rule.field}
                onChange={(key) => {
                  const newDef = getFieldDef(key);
                  const newType = newDef?.type ?? "text";
                  const newOps = OPERATORS_BY_TYPE[newType];
                  const op = newOps.includes(rule.operator) ? rule.operator : newOps[0];
                  updateRule(rule.id, { field: key, operator: op, value: "" });
                }}
              />

              {/* Operator */}
              <OperatorPicker
                fieldType={fieldType}
                value={rule.operator}
                onChange={(op) => {
                  const patch: Partial<FilterRule> = { operator: op };
                  if (UNARY_OPERATORS.includes(op)) patch.value = "";
                  updateRule(rule.id, patch);
                }}
              />

              {/* Value (hidden for unary operators) */}
              {!isUnary && fieldDef && (
                <ValueInput
                  fieldDef={fieldDef}
                  value={rule.value}
                  onChange={(val) => updateRule(rule.id, { value: val })}
                />
              )}

              {/* Remove */}
              <button
                onClick={() => removeRule(rule.id)}
                className="ml-auto h-5 w-5 shrink-0 flex items-center justify-center rounded text-neutral-300 opacity-0 group-hover:opacity-100 hover:text-neutral-600 hover:bg-neutral-100 transition-all cursor-pointer"
              >
                <RiCloseLine className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer: Add filter */}
      <div className="border-t border-neutral-100 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={addRule}
          className="h-7 gap-1 px-2 text-[11px] font-medium text-neutral-500 hover:text-neutral-900"
        >
          <RiAddLine className="h-3.5 w-3.5" />
          Add filter
        </Button>
      </div>
    </div>
  );
}
