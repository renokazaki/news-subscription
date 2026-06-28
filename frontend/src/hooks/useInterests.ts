import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Interest } from "@/types/interest";

export const useInterests = () => {
  return useQuery({
    queryKey: ["interests"],
    queryFn: () => api<Interest[]>("/interests"),
  });
};

export const useCreateInterest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyword: string) =>
      api<Interest>("/interests", {
        method: "POST",
        body: JSON.stringify({ interest: { keyword } }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interests"] });
    },
  });
};

export const useUpdateInterest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, keyword }: { id: number; keyword: string }) =>
      api<Interest>(`/interests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ interest: { keyword } }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interests"] });
    },
  });
};

export const useDeleteInterest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api<void>(`/interests/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interests"] });
    },
  });
};
