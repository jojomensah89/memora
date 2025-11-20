import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/utils/api-client";
import { toast } from "sonner";

export type RuleTag = {
  id: string;
  name: string;
  color: string;
  userId: string;
};

export type Rule = {
  id: string;
  name: string;
  content: string;
  description?: string;
  scope: "GLOBAL" | "LOCAL";
  isActive: boolean;
  tags: RuleTag[];
  createdAt: string;
  updatedAt: string;
};

type RulesResponse = {
  rules: Rule[];
  stats: {
    total: number;
    global: number;
    local: number;
    active: number;
    inactive: number;
  };
};

export type CreateRuleInput = {
  name: string;
  content: string;
  description?: string;
  scope: "GLOBAL" | "LOCAL";
  tags?: string[];
  isActive?: boolean;
  chatId?: string;
};

export type UpdateRuleInput = Partial<CreateRuleInput>;

export type RuleFilters = {
  query?: string;
  scope?: "GLOBAL" | "LOCAL";
  isActive?: boolean;
  tags?: string[];
};

export function useRules(filters?: RuleFilters) {
  return useQuery<RulesResponse>({
    queryKey: ["rules", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.query) params.append("query", filters.query);
      if (filters?.scope) params.append("scope", filters.scope);
      if (filters?.isActive !== undefined)
        params.append("isActive", String(filters.isActive));
      if (filters?.tags?.length) {
        filters.tags.forEach((tag) => params.append("tags", tag));
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/api/rules?${queryString}` : "/api/rules";
      return apiClient.get<RulesResponse>(endpoint);
    },
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRuleInput) => {
      return apiClient.post<Rule>("/api/rules", input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast.success("Rule created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create rule: ${error.message}`);
    },
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateRuleInput }) => {
      return apiClient.put<{ success: boolean }>(`/api/rules/${id}`, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast.success("Rule updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update rule: ${error.message}`);
    },
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete<{ success: boolean }>(`/api/rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast.success("Rule deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete rule: ${error.message}`);
    },
  });
}

export function useToggleRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.post<{ success: boolean }>(`/api/rules/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      // Toast is optional here as the switch provides visual feedback, 
      // but good for confirmation
      toast.success("Rule status updated");
    },
    onError: (error) => {
      toast.error(`Failed to toggle rule: ${error.message}`);
    },
  });
}
