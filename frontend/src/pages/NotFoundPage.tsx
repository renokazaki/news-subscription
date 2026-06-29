import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-muted-foreground">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
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
