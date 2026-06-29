import { useAtom } from "jotai";
import { selectedDateAtom, selectedTagAtom } from "@/store/filters";
import { useInterests } from "@/hooks/useInterests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsFilters() {
  const { data: interests } = useInterests();
  const [selectedTag, setSelectedTag] = useAtom(selectedTagAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm text-muted-foreground">タグで絞り込み</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag(undefined)}
          >
            すべて
          </Button>
          {interests?.map((interest) => (
            <Button
              key={interest.id}
              variant={selectedTag === interest.keyword ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(interest.keyword)}
            >
              {interest.keyword}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">日付で絞り込み</p>
        <Input
          type="date"
          className="w-auto"
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value || undefined)}
        />
        {selectedDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(undefined)}
          >
            クリア
          </Button>
        )}
      </div>
    </div>
  );
}
