"use client";

import { useEffect, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { type Rule, useRules } from "@/hooks/use-rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RuleCard } from "./components/rule-card";
import { RuleDialog } from "./components/rule-dialog";
import { DeleteRuleDialog } from "./components/delete-rule-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RulesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"GLOBAL" | "LOCAL" | "ALL">("ALL");
  const [activeFilter, setActiveFilter] = useState<"ACTIVE" | "INACTIVE" | "ALL">("ALL");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [deletingRule, setDeletingRule] = useState<Rule | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError } = useRules({
    query: debouncedSearchQuery || undefined,
    scope: scopeFilter === "ALL" ? undefined : scopeFilter,
    isActive: activeFilter === "ALL" ? undefined : activeFilter === "ACTIVE",
  });

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
  };

  const handleDelete = (rule: Rule) => {
    setDeletingRule(rule);
  };

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rules</h2>
          <p className="text-muted-foreground">
            Manage behavioral rules for the AI to follow during conversations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={scopeFilter}
            onValueChange={(value) => setScopeFilter(value as any)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Scopes</SelectItem>
              <SelectItem value="GLOBAL">Global</SelectItem>
              <SelectItem value="LOCAL">Local</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={activeFilter}
            onValueChange={(value) => setActiveFilter(value as any)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">Error loading rules</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              We couldn't fetch your rules. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      ) : data?.rules.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No rules found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {debouncedSearchQuery || scopeFilter !== "ALL" || activeFilter !== "ALL"
                ? "No rules match your filters. Try adjusting them."
                : "You haven't created any rules yet. Add a rule to customize the AI's behavior."}
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <RuleDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <RuleDialog
        open={!!editingRule}
        onOpenChange={(open) => !open && setEditingRule(null)}
        rule={editingRule}
      />

      <DeleteRuleDialog
        open={!!deletingRule}
        onOpenChange={(open) => !open && setDeletingRule(null)}
        rule={deletingRule}
      />
    </div>
  );
}
