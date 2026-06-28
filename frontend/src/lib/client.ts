import createClient from "openapi-fetch";
import type { paths } from "./api/v1";

function getToken(): string | null {
  return localStorage.getItem("auth-token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth-token", token);
}

export function clearToken(): void {
  localStorage.removeItem("auth-token");
}

const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

client.use({
  async onRequest({ request }) {
    const token = getToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      clearToken();
      window.location.href = "/sign-in";
    }
    return response;
  },
});

export default client;
