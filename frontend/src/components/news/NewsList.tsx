import { Link } from "react-router";
import { useAtom } from "jotai";
import { selectedDateAtom, selectedTagAtom } from "@/store/filters";
import { useNewsList } from "@/hooks/useNews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NewsList() {
  const [selectedDate] = useAtom(selectedDateAtom);
  const [selectedTag] = useAtom(selectedTagAtom);
  const { data: news, isLoading } = useNewsList({
    date: selectedDate,
    tag: selectedTag,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">読み込み中...</p>;
  }

  if (!news || news.length === 0) {
    return <p className="text-sm text-muted-foreground">ニュースがありません</p>;
  }

  return (
    <div className="space-y-3">
      {news.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                <Link
                  to={`/news/${item.id}`}
                  className="hover:underline"
                >
                  {item.title}
                </Link>
              </CardTitle>
              <span className="rounded bg-muted px-2 py-0.5 text-xs">
                {item.tag}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              {new Date(item.published_at).toLocaleDateString("ja-JP")}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
