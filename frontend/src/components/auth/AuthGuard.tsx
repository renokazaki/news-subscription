import { Outlet, Navigate } from "react-router";
import { useCurrentUser } from "@/hooks/useAuth";

export function AuthGuard() {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !user) return <Navigate to="/sign-in" replace />;

  return <Outlet />;
}
