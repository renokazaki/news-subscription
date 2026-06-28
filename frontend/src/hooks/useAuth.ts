import { useQueryClient } from "@tanstack/react-query";
import $api from "@/lib/$api";
import { setToken, clearToken } from "@/lib/client";

export const useCurrentUser = () => {
  return $api.useQuery("get", "/api/v1/user", undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("post", "/api/v1/auth/sign_in", {
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/user"] });
    },
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("post", "/api/v1/auth/sign_up", {
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["get", "/api/v1/user"] });
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  return $api.useMutation("delete", "/api/v1/auth/sign_out", {
    onSuccess: () => {
      clearToken();
      queryClient.clear();
    },
  });
};
