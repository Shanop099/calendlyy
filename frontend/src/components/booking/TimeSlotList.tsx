import { formatTimeOnly } from "@/lib/utils";
import type { SlotDto } from "@/lib/api";

export function TimeSlotList({
  slots,
  selected,
  onSelect,
}: {
  slots: SlotDto[];
  selected?: string;
  onSelect: (slot: SlotDto) => void;
}) {
  if (!slots.length) {
    return <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">No time slots available for this date.</div>;
  }

  return (
    <div className="grid gap-3">
      {slots.map((slot) => (
        <button
          key={slot.start}
          type="button"
          onClick={() => onSelect(slot)}
          className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold ${
            selected === slot.start ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          {formatTimeOnly(slot.start)}
        </button>
      ))}
    </div>
  );
}
