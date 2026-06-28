import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, setToken, clearToken } from "@/lib/api";
import type { User } from "@/types/user";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => api<User>("/user"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const res = await api<{ user: User; token: string }>("/auth/sign_in", {
        method: "POST",
        body: JSON.stringify({ user: { email, password } }),
      });
      setToken(res.token); // JWTをlocalStorageに保存
      return res.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      email: string;
      password: string;
      password_confirmation: string;
      display_name: string;
    }) => {
      const res = await api<{ user: User; token: string }>("/auth/sign_up", {
        method: "POST",
        body: JSON.stringify({ user: params }),
      });
      setToken(res.token);
      return res.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api("/auth/sign_out", { method: "DELETE" }),
    onSuccess: () => {
      clearToken();
      queryClient.clear(); // 全キャッシュクリア（認証済みデータを残さない）
    },
  });
};
