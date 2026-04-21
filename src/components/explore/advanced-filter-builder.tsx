"use client";

import { useState } from "react";
import {
  RiCloseLine,
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowDownSLine,
  RiParenthesesLine,
  RiFilter3Line,
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

// ── Exported Types (Recursive Tree) ──

export type LogicalOperator = "AND" | "OR";

export type RuleOperator =
  | "is"
  | "is not"
  | "contains"
  | "does not contain"
  | "greater than"
  | "less than"
  | "is empty"
  | "is not empty";

export interface FilterRule {
  type: "rule";
  id: string;
  field: string;
  operator: RuleOperator;
  value: string;
}

export interface FilterGroup {
  type: "group";
  id: string;
  logicalOperator: LogicalOperator;
  children: FilterNode[];
}

export type FilterNode = FilterRule | FilterGroup;

/** The root query IS a FilterGroup */
export type FilterQuery = FilterGroup;

// ── Field Definitions (exported for filtering engine) ──

export type FieldType = "enum" | "number" | "text" | "date";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export const FIELDS: FieldDef[] = [
  // Classification & Risk
  { key: "label", label: "Label", type: "enum", options: ["All Infringements", "Adult Content", "Branded Packaging", "Copyright Infringement", "Counterfeit", "Design Infringement", "Grey Market", "Infringement Non-Commercial"] },
  { key: "reasons", label: "Reasons", type: "enum", options: ["Obvious counterfeit", "Highly suspicious", "Suspicious"] },
  { key: "risk_score", label: "Risk Score", type: "number" },
  { key: "insight", label: "Insight", type: "enum", options: ["New Listing", "Price Drop", "Repeat Offender", "Trending"] },
  { key: "tags", label: "Tags", type: "text" },

  // Product & Commerce
  { key: "product_category", label: "Product Category", type: "enum", options: ["Accessories", "Bag Wallet", "Clothing", "Cosmetics", "Entertainment", "Jewelry", "Luggage", "Shoe", "Others"] },
  { key: "product_line", label: "Product Line", type: "text" },
  { key: "product_name", label: "Product Name", type: "text" },
  { key: "product_identifier", label: "Product Identifier", type: "text" },
  { key: "price", label: "Price", type: "number" },
  { key: "stock", label: "Stock", type: "number" },
  { key: "bundle", label: "Items in Bundle", type: "number" },

  // Source & Network
  { key: "channel", label: "Channel", type: "enum", options: ["Social Media", "Marketplace", "Ecommerce", "Ads", "News & Blogs"] },
  { key: "website", label: "Website", type: "text" },
  { key: "contact_info", label: "Contact Info", type: "enum", options: ["Phone Number", "Email Address", "WeChat", "WhatsApp", "Facebook", "Instagram", "Telegram", "Line", "Zalo"] },
  { key: "followers", label: "Followers", type: "number" },
  { key: "geo_ships_to", label: "Estimated Geo (Ships To)", type: "enum", options: ["United States", "United Kingdom", "Germany", "France", "China", "Japan", "South Korea", "Brazil", "Italy", "Spain"] },
  { key: "geo_ships_from", label: "Estimated Geo (Ships From)", type: "enum", options: ["United States", "United Kingdom", "Germany", "France", "China", "Japan", "South Korea", "Brazil", "Italy", "Spain"] },

  // Operations & Enforcement
  { key: "takedown_post", label: "Takedown Status (Post)", type: "enum", options: ["Pending", "Removed", "Failed", "Ignored"] },
  { key: "takedown_account", label: "Takedown Status (Account)", type: "enum", options: ["Pending", "Removed", "Failed", "Ignored"] },
  { key: "takedown_website", label: "Takedown Status (Website)", type: "enum", options: ["Pending", "Removed", "Failed", "Ignored"] },
  { key: "enforcement_ip", label: "Enforcement IP Asset", type: "text" },
  { key: "validation_errors", label: "Validation Errors", type: "text" },
  { key: "enforcement_status", label: "Enforcement Status", type: "text" },
  { key: "moderation_method", label: "Moderation Method", type: "enum", options: ["Automated", "Manual"] },
  { key: "search_rank", label: "Highest Rank in Search", type: "number" },
  { key: "users", label: "Users", type: "text" },
];

const OPERATORS_BY_TYPE: Record<FieldType, RuleOperator[]> = {
  enum: ["is", "is not", "is empty", "is not empty"],
  number: ["is", "is not", "greater than", "less than", "is empty", "is not empty"],
  text: ["is", "is not", "contains", "does not contain", "is empty", "is not empty"],
  date: ["is", "is not", "greater than", "less than", "is empty", "is not empty"],
};

const UNARY_OPERATORS: RuleOperator[] = ["is empty", "is not empty"];

export function getFieldDef(key: string): FieldDef | undefined {
  return FIELDS.find((f) => f.key === key);
}

let _nodeId = 0;
function nextNodeId(prefix: string): string {
  return `${prefix}-${++_nodeId}`;
}

export function createBlankRule(): FilterRule {
  return { type: "rule", id: nextNodeId("rule"), field: "label", operator: "is", value: "" };
}

export function createBlankGroup(): FilterGroup {
  return { type: "group", id: nextNodeId("group"), logicalOperator: "AND", children: [] };
}

export const DEFAULT_QUERY: FilterQuery = {
  type: "group",
  id: "root",
  logicalOperator: "AND",
  children: [],
};

/** Flatten all FilterRule nodes from a recursive tree */
export function flattenRules(node: FilterNode): FilterRule[] {
  if (node.type === "rule") return [node];
  return node.children.flatMap(flattenRules);
}

// ── Recursive tree update helpers ──

export function updateNodeInTree(root: FilterGroup, nodeId: string, updater: (node: FilterNode) => FilterNode): FilterGroup {
  return {
    ...root,
    children: root.children.map((child) => {
      if (child.id === nodeId) return updater(child);
      if (child.type === "group") return updateNodeInTree(child, nodeId, updater);
      return child;
    }),
  };
}

export function removeNodeFromTree(root: FilterGroup, nodeId: string): FilterGroup {
  return {
    ...root,
    children: root.children
      .filter((child) => child.id !== nodeId)
      .map((child) =>
        child.type === "group" ? removeNodeFromTree(child, nodeId) : child
      ),
  };
}

function addChildToGroup(root: FilterGroup, groupId: string, newChild: FilterNode): FilterGroup {
  if (root.id === groupId) {
    return { ...root, children: [...root.children, newChild] };
  }
  return {
    ...root,
    children: root.children.map((child) =>
      child.type === "group" ? addChildToGroup(child, groupId, newChild) : child
    ),
  };
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
        <button className="flex items-center gap-1 h-7 px-2 text-xs font-medium text-foreground rounded-md hover:bg-muted transition-colors cursor-pointer whitespace-nowrap">
          {def?.label ?? "Select field"}
          <RiArrowDownSLine className="h-3 w-3 text-muted-foreground" />
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
        <button className="flex items-center gap-1 h-7 px-2 text-xs text-muted-foreground rounded-md hover:bg-muted transition-colors cursor-pointer whitespace-nowrap">
          {value}
          <RiArrowDownSLine className="h-3 w-3 text-muted-foreground" />
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
                ? "bg-muted font-medium text-foreground"
                : "text-foreground hover:bg-accent"
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
          <button className="flex items-center gap-1 h-7 px-2 text-xs rounded-md hover:bg-muted transition-colors cursor-pointer whitespace-nowrap max-w-[160px] truncate">
            <span className={value ? "font-medium text-foreground" : "text-muted-foreground"}>
              {value || "Select..."}
            </span>
            <RiArrowDownSLine className="h-3 w-3 text-muted-foreground shrink-0" />
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
      className="h-7 w-[120px] border-border bg-transparent px-2 text-xs shadow-none focus-visible:ring-1 focus-visible:ring-ring"
    />
  );
}

// ── Recursive Group Renderer ──

function FilterGroupNode({
  group,
  rootQuery,
  onRootChange,
  isRoot,
}: {
  group: FilterGroup;
  rootQuery: FilterGroup;
  onRootChange: (q: FilterGroup) => void;
  isRoot: boolean;
}) {
  const toggleOperator = () => {
    onRootChange(
      updateNodeInTree(rootQuery, group.id, (n) => ({
        ...(n as FilterGroup),
        logicalOperator: (n as FilterGroup).logicalOperator === "AND" ? "OR" : "AND",
      })) as FilterGroup
    );
  };

  const handleAddRule = () => {
    onRootChange(addChildToGroup(rootQuery, group.id, createBlankRule()));
  };

  const handleAddGroup = () => {
    onRootChange(addChildToGroup(rootQuery, group.id, createBlankGroup()));
  };

  const handleRemoveNode = (nodeId: string) => {
    onRootChange(removeNodeFromTree(rootQuery, nodeId));
  };

  const handleUpdateRule = (ruleId: string, patch: Partial<FilterRule>) => {
    onRootChange(
      updateNodeInTree(rootQuery, ruleId, (n) => ({ ...(n as FilterRule), ...patch }))
    );
  };

  const wrapperClass = isRoot
    ? "flex flex-col"
    : "flex flex-col border-l-2 border-border pl-3 ml-2 my-1 rounded-sm";

  return (
    <div className={wrapperClass}>
      {/* Nested group header (non-root only) */}
      {!isRoot && (
        <div className="flex items-center justify-between py-1 pr-1">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>Match</span>
            <button
              onClick={toggleOperator}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {group.logicalOperator === "AND" ? "All" : "Any"}
            </button>
          </div>
          <button
            onClick={() => handleRemoveNode(group.id)}
            className="h-4 w-4 shrink-0 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <RiCloseLine className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Children: rules + nested groups */}
      <div className="flex flex-col">
        {group.children.length === 0 && isRoot && (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in-50">
            <div className="mb-3 rounded-full bg-muted p-3">
              <RiFilter3Line className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">No filters applied</p>
            <p className="mb-4 max-w-[200px] text-xs text-muted-foreground">
              Get started by adding a rule to narrow down your results.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRule}
              className="h-8 gap-1.5 bg-card text-xs"
            >
              <RiAddLine className="h-3 w-3" />
              Add your first filter
            </Button>
          </div>
        )}
        {group.children.length === 0 && !isRoot && (
          <div className="px-2 py-2 text-[10px] text-muted-foreground">
            Empty group — add a filter.
          </div>
        )}
        {group.children.map((child, idx) => {
          if (child.type === "group") {
            return (
              <div key={child.id} className="flex items-start gap-0.5">
                <span className="w-8 shrink-0 pt-2 text-right text-[10px] font-medium uppercase text-muted-foreground select-none">
                  {idx === 0 ? "Where" : group.logicalOperator === "AND" ? "and" : "or"}
                </span>
                <div className="flex-1 min-w-0">
                  <FilterGroupNode
                    group={child}
                    rootQuery={rootQuery}
                    onRootChange={onRootChange}
                    isRoot={false}
                  />
                </div>
              </div>
            );
          }

          // It's a rule
          const rule = child;
          const fieldDef = getFieldDef(rule.field);
          const fieldType = fieldDef?.type ?? "text";
          const isUnary = UNARY_OPERATORS.includes(rule.operator);

          return (
            <div
              key={rule.id}
              className="group flex items-center gap-0.5 rounded-md px-1 py-0.5 hover:bg-accent transition-colors"
            >
              <span className="w-8 shrink-0 text-right text-[10px] font-medium uppercase text-muted-foreground select-none">
                {idx === 0 ? "Where" : group.logicalOperator === "AND" ? "and" : "or"}
              </span>
              <FieldPicker
                value={rule.field}
                onChange={(key) => {
                  const newDef = getFieldDef(key);
                  const newType = newDef?.type ?? "text";
                  const newOps = OPERATORS_BY_TYPE[newType];
                  const op = newOps.includes(rule.operator) ? rule.operator : newOps[0];
                  handleUpdateRule(rule.id, { field: key, operator: op, value: "" });
                }}
              />
              <OperatorPicker
                fieldType={fieldType}
                value={rule.operator}
                onChange={(op) => {
                  const patch: Partial<FilterRule> = { operator: op };
                  if (UNARY_OPERATORS.includes(op)) patch.value = "";
                  handleUpdateRule(rule.id, patch);
                }}
              />
              {!isUnary && fieldDef && (
                <ValueInput
                  fieldDef={fieldDef}
                  value={rule.value}
                  onChange={(val) => handleUpdateRule(rule.id, { value: val })}
                />
              )}
              <button
                onClick={() => handleRemoveNode(rule.id)}
                className="ml-auto h-5 w-5 shrink-0 flex items-center justify-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted transition-all cursor-pointer"
              >
                <RiCloseLine className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer: Add rule / Add group */}
      <div className={`flex items-center gap-1 ${isRoot ? "border-t border-border px-3 py-2" : "px-1 py-1"}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddRule}
          className="h-7 gap-1 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <RiAddLine className="h-3.5 w-3.5" />
          Add filter
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddGroup}
          className="h-7 gap-1 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <RiParenthesesLine className="h-3.5 w-3.5" />
          Add group
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ──

interface AdvancedFilterBuilderProps {
  query: FilterQuery;
  onQueryChange: (query: FilterQuery) => void;
  onSwitchToBasic: () => void;
}

export function AdvancedFilterBuilder({ query, onQueryChange, onSwitchToBasic }: AdvancedFilterBuilderProps) {
  return (
    <div className="flex flex-col">
      {/* Header: Back + Root Logical Operator */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <button
          onClick={onSwitchToBasic}
          className="flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <RiArrowLeftSLine className="h-3.5 w-3.5" />
          Basic Filters
        </button>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span>Match</span>
          <button
            onClick={() =>
              onQueryChange({
                ...query,
                logicalOperator: query.logicalOperator === "AND" ? "OR" : "AND",
              })
            }
            className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {query.logicalOperator === "AND" ? "All" : "Any"}
          </button>
          <span>of the following</span>
        </div>
      </div>

      {/* Recursive Group Renderer */}
      <div className="px-2 py-1.5">
        <FilterGroupNode
          group={query}
          rootQuery={query}
          onRootChange={onQueryChange}
          isRoot={true}
        />
      </div>
    </div>
  );
}
