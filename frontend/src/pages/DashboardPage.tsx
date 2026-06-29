import { useNavigate } from "react-router";
import { useCurrentUser, useSignOut } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InterestList } from "@/components/interests/InterestList";
import { NewsFilters } from "@/components/news/NewsFilters";
import { NewsList } from "@/components/news/NewsList";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut.mutate(
      {},
      { onSuccess: () => navigate("/sign-in", { replace: true }) },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">News Subscription</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.display_name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={signOut.isPending}
            >
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold">ダッシュボード</h2>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <NewsFilters />
            <NewsList />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">プロフィール</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">表示名: </span>
                  {user?.display_name}
                </p>
                <p>
                  <span className="text-muted-foreground">メール: </span>
                  {user?.email}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">興味・関心キーワード</CardTitle>
              </CardHeader>
              <CardContent>
                <InterestList />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
