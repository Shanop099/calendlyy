import { weekdayNames } from "@/lib/utils";

export function WeekdayToggle({
  day,
  checked,
  onChange,
}: {
  day: number;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-700">{weekdayNames[day]}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
