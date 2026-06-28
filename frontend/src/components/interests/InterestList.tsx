import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterestForm } from "./InterestForm";
import {
  useInterests,
  useCreateInterest,
  useUpdateInterest,
  useDeleteInterest,
} from "@/hooks/useInterests";

export function InterestList() {
  const { data: interests, isLoading } = useInterests();
  const createInterest = useCreateInterest();
  const updateInterest = useUpdateInterest();
  const deleteInterest = useDeleteInterest();
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleCreate = (keyword: string) => {
    createInterest.mutate(
      { body: { interest: { keyword } } },
      {
        onSuccess: () => toast.success("キーワードを登録しました"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleUpdate = (id: number, keyword: string) => {
    updateInterest.mutate(
      { params: { path: { id } }, body: { interest: { keyword } } },
      {
        onSuccess: () => {
          toast.success("キーワードを更新しました");
          setEditingId(null);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteInterest.mutate(
      { params: { path: { id } } },
      {
        onSuccess: () => toast.success("キーワードを削除しました"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">読み込み中...</p>;
  }

  return (
    <div className="space-y-4">
      <InterestForm
        onSubmit={handleCreate}
        isPending={createInterest.isPending}
      />

      {interests && interests.length > 0 ? (
        <ul className="space-y-2">
          {interests.map((interest) => (
            <li
              key={interest.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              {editingId === interest.id ? (
                <InterestForm
                  defaultValue={interest.keyword}
                  onSubmit={(keyword) => handleUpdate(interest.id, keyword)}
                  onCancel={() => setEditingId(null)}
                  isPending={updateInterest.isPending}
                  submitLabel="更新"
                />
              ) : (
                <>
                  <span className="text-sm">{interest.keyword}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(interest.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(interest.id)}
                      disabled={deleteInterest.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          まだキーワードが登録されていません。上のフォームから追加してください。
        </p>
      )}
    </div>
  );
}
