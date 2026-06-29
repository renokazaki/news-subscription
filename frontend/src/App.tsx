import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LandingPage } from "@/pages/LandingPage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { NewsDetailPage } from "@/pages/NewsDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ErrorPage } from "@/pages/ErrorPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error.message.includes("401") || error.message.includes("403")) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
    mutations: {
      onError: (error) => {
        toast.error(error.message);
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} errorElement={<ErrorPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route element={<AuthGuard />} errorElement={<ErrorPage />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
