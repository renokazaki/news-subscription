const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

function getToken(): string | null {
  return localStorage.getItem("auth-token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth-token", token);
}

export function clearToken(): void {
  localStorage.removeItem("auth-token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    window.location.href = "/sign-in";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.error || body.errors?.join(", ") || `API Error: ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
