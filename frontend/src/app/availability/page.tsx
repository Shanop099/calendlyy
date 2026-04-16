"use client";

import { useState } from "react";
import { WeekdayToggle } from "@/components/availability/WeekdayToggle";
import { TimeRangePicker } from "@/components/availability/TimeRangePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAvailability } from "@/hooks/useAvailability";
import { updateAvailability } from "@/lib/api";
import { weekdayNames } from "@/lib/utils";

export default function AvailabilityPage() {
  const { data, loading, error, setData } = useAvailability();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (loading) return <main className="min-h-screen bg-slate-50 p-6 text-slate-500">Loading availability...</main>;
  if (error || !data?.schedule) return <main className="min-h-screen bg-slate-50 p-6 text-rose-700">{error || "No schedule found"}</main>;
  const schedule = data.schedule;

  async function save() {
    try {
      setSaving(true);
      setMessage(null);
      const updatedSchedule = await updateAvailability({
        timezone: schedule.timezone,
        rules: schedule.rules,
      });
      setData((current) => (current ? { ...current, schedule: updatedSchedule } : current));
      setMessage("Availability saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to save availability");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Availability</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Working hours</h1>
        {message ? <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{message}</div> : null}
        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Timezone</span>
            <Input
              value={schedule.timezone}
              onChange={(e) =>
                setData((current) =>
                  current?.schedule ? { ...current, schedule: { ...current.schedule, timezone: e.target.value } } : current,
                )
              }
            />
          </label>
          <div className="mt-6 space-y-4">
            {schedule.rules.map((rule, index) => (
              <div key={rule.day_of_week} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">{weekdayNames[rule.day_of_week]}</span>
                  <WeekdayToggle
                    day={rule.day_of_week}
                    checked={rule.is_available}
                    onChange={(checked) =>
                      setData((current) => {
                        if (!current?.schedule) return current;
                        const rules = [...current.schedule.rules];
                        rules[index] = { ...rules[index], is_available: checked };
                        return { ...current, schedule: { ...current.schedule, rules } };
                      })
                    }
                  />
                </div>
                <TimeRangePicker
                  disabled={!rule.is_available}
                  start={rule.start_time}
                  end={rule.end_time}
                  onStartChange={(value) =>
                    setData((current) => {
                      if (!current?.schedule) return current;
                      const rules = [...current.schedule.rules];
                      rules[index] = { ...rules[index], start_time: value };
                      return { ...current, schedule: { ...current.schedule, rules } };
                    })
                  }
                  onEndChange={(value) =>
                    setData((current) => {
                      if (!current?.schedule) return current;
                      const rules = [...current.schedule.rules];
                      rules[index] = { ...rules[index], end_time: value };
                      return { ...current, schedule: { ...current.schedule, rules } };
                    })
                  }
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save availability"}</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
