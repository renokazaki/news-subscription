import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { Button } from "@/components/ui/button";

export function ErrorPage() {
  const error = useRouteError();

  let title = "予期しないエラーが発生しました";
  let description = "申し訳ありません。問題が発生しました。";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "ページが見つかりません";
      description = "お探しのページは存在しないか、移動した可能性があります。";
    } else {
      title = `${error.status}: ${error.statusText}`;
      description = "リクエストの処理中にエラーが発生しました。";
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-4 text-muted-foreground">{description}</p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link to="/dashboard">ダッシュボードへ</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/">トップページへ</Link>
        </Button>
      </div>
    </div>
  );
}
