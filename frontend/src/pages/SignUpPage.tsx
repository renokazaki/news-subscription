import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSignUp } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SignUpPage() {
  const navigate = useNavigate();
  const signUp = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signUp.mutate(
      {
        body: {
          user: {
            email,
            password,
            password_confirmation: passwordConfirmation,
            display_name: displayName,
          },
        },
      },
      { onSuccess: () => navigate("/dashboard", { replace: true }) },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">新規登録</CardTitle>
          <CardDescription>アカウントを作成してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
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
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">パスワード（確認）</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {signUp.isError && (
              <p className="text-sm text-destructive">{signUp.error.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={signUp.isPending}>
              {signUp.isPending ? "登録中..." : "アカウント作成"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            既にアカウントをお持ちの方は{" "}
            <Link to="/sign-in" className="text-primary underline">
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
