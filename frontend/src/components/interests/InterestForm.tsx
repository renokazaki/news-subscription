import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const interestSchema = z.object({
  keyword: z
    .string()
    .min(1, "キーワードを入力してください")
    .max(20, "キーワードは20文字以内で入力してください"),
});

type InterestFormData = z.infer<typeof interestSchema>;

type Props = {
  defaultValue?: string;
  onSubmit: (keyword: string) => void;
  onCancel?: () => void;
  isPending: boolean;
  submitLabel?: string;
};

export function InterestForm({
  defaultValue = "",
  onSubmit,
  onCancel,
  isPending,
  submitLabel = "登録",
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InterestFormData>({
    resolver: zodResolver(interestSchema),
    defaultValues: { keyword: defaultValue },
  });

  const handleFormSubmit = (data: InterestFormData) => {
    onSubmit(data.keyword);
    if (!defaultValue) reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex gap-2">
      <div className="flex-1 space-y-1">
        <Label htmlFor="keyword" className="sr-only">
          キーワード
        </Label>
        <Input
          id="keyword"
          placeholder="例: TypeScript, AWS, React..."
          {...register("keyword")}
        />
        {errors.keyword && (
          <p className="text-xs text-destructive">{errors.keyword.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "処理中..." : submitLabel}
      </Button>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
      )}
    </form>
  );
}
