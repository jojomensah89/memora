import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiClient } from "@/utils/api-client";

export function useDeleteChat() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (chatId: string) =>
      apiClient.delete(`/api/chats/${chatId}`),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });

      toast.success("Chat deleted successfully");

      router.push("/chat");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete chat");
    },
  });
}
