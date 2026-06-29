import $api from "@/lib/$api";

export const useNewsList = (filters?: { date?: string; tag?: string }) => {
  return $api.useQuery("get", "/api/v1/news", {
    params: { query: filters },
  });
};

export const useNewsDetail = (id: number) => {
  return $api.useQuery("get", "/api/v1/news/{id}", {
    params: { path: { id } },
  });
};
