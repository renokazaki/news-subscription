import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSignIn } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SignInPage() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn.mutate(
      { email, password },
      { onSuccess: () => navigate("/dashboard", { replace: true }) },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>メールアドレスとパスワードを入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {signIn.isError && (
              <p className="text-sm text-destructive">{signIn.error.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={signIn.isPending}>
              {signIn.isPending ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            アカウントをお持ちでない方は{" "}
            <Link to="/sign-up" className="text-primary underline">
              新規登録
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
