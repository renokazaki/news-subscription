import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">News Subscription</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sign-in">ログイン</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/sign-up">新規登録</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            あなたの興味に合わせた
            <br />
            ニュースを自動収集
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            キーワードを登録するだけで、最新のニュースを定期的に収集し、
            AI が要約してお届けします。
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/sign-up">無料で始める</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/sign-in">ログイン</Link>
            </Button>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <h3 className="mb-10 text-center text-2xl font-bold">
              3ステップで簡単に始められます
            </h3>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  1
                </div>
                <h4 className="mb-2 font-semibold">アカウント作成</h4>
                <p className="text-sm text-muted-foreground">
                  メールアドレスとパスワードで簡単に登録できます。
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  2
                </div>
                <h4 className="mb-2 font-semibold">キーワード登録</h4>
                <p className="text-sm text-muted-foreground">
                  React、Rails、AWSなど興味のあるキーワードを登録します。
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  3
                </div>
                <h4 className="mb-2 font-semibold">ニュースを受け取る</h4>
                <p className="text-sm text-muted-foreground">
                  AIが要約した最新ニュースがダッシュボードに届きます。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <h3 className="mb-10 text-center text-2xl font-bold">特長</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-6">
                <h4 className="mb-2 font-semibold">AI による自動要約</h4>
                <p className="text-sm text-muted-foreground">
                  収集したニュースをAIが日本語で2〜3文に要約。忙しい時でもポイントを素早く把握できます。
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h4 className="mb-2 font-semibold">キーワードでフィルタ</h4>
                <p className="text-sm text-muted-foreground">
                  登録したキーワードごとにニュースを絞り込み。興味のある分野だけを効率的にチェックできます。
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h4 className="mb-2 font-semibold">定期的な自動収集</h4>
                <p className="text-sm text-muted-foreground">
                  登録したキーワードのニュースを定期的に自動収集。手動で検索する手間がなくなります。
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h4 className="mb-2 font-semibold">日付フィルタ</h4>
                <p className="text-sm text-muted-foreground">
                  特定の日付のニュースだけを表示。過去の記事も簡単に振り返れます。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; 2026 News Subscription. All rights reserved.</p>
      </footer>
    </div>
  );
}
