import { Input } from "@/components/ui/Input";

export function TimeRangePicker({
  start,
  end,
  onStartChange,
  onEndChange,
  disabled,
}: {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Input type="time" disabled={disabled} value={start.slice(0, 5)} onChange={(e) => onStartChange(`${e.target.value}:00`)} />
      <Input type="time" disabled={disabled} value={end.slice(0, 5)} onChange={(e) => onEndChange(`${e.target.value}:00`)} />
    </div>
  );
}
