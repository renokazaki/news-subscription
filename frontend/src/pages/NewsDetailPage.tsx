import { useParams, Link } from "react-router";
import { useNewsDetail } from "@/hooks/useNews";

export function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: news, isLoading } = useNewsDetail(Number(id!));

  if (isLoading) {
    return <div className="p-8">読み込み中...</div>;
  }

  if (!news) {
    return <div className="p-8">ニュースが見つかりません</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/dashboard"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← ダッシュボードに戻る
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{news.title}</h1>
      <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="rounded bg-muted px-2 py-0.5 text-xs">{news.tag}</span>
        <span>{new Date(news.published_at).toLocaleDateString("ja-JP")}</span>
      </div>
      <div className="mt-6 leading-relaxed">{news.text}</div>
      <a
        href={news.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm text-primary hover:underline"
      >
        元の記事を読む →
      </a>
    </div>
  );
}
