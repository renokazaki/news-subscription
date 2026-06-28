import { useQueryClient } from "@tanstack/react-query";
import $api from "@/lib/$api";

const INTERESTS_KEY = ["get", "/api/v1/interests"] as const;

export const useInterests = () => {
  return $api.useQuery("get", "/api/v1/interests");
};

export const useCreateInterest = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("post", "/api/v1/interests", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INTERESTS_KEY] });
    },
  });
};

export const useUpdateInterest = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("patch", "/api/v1/interests/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INTERESTS_KEY] });
    },
  });
};

export const useDeleteInterest = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("delete", "/api/v1/interests/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INTERESTS_KEY] });
    },
  });
};
