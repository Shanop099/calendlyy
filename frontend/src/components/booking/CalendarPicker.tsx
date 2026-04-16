"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { toInputDate } from "@/lib/utils";

export function CalendarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const date = new Date(value);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => {
          const next = new Date(date);
          next.setDate(next.getDate() - 1);
          onChange(toInputDate(next));
        }} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-2.5" />
        <button type="button" onClick={() => {
          const next = new Date(date);
          next.setDate(next.getDate() + 1);
          onChange(toInputDate(next));
        }} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
