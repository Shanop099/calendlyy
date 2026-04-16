"use client";

import { useEffect, useState } from "react";
import type { BookingInput } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function BookingForm({
  selectedStartTime,
  onSubmit,
}: {
  selectedStartTime?: string;
  onSubmit: (value: BookingInput) => Promise<void>;
}) {
  const [form, setForm] = useState<BookingInput>({
    invitee_name: "",
    invitee_email: "",
    start_time: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((value) => ({ ...value, start_time: selectedStartTime ?? "" }));
  }, [selectedStartTime]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      {error ? <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Your name</span>
          <Input value={form.invitee_name} onChange={(e) => setForm((v) => ({ ...v, invitee_name: e.target.value }))} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
          <Input type="email" value={form.invitee_email} onChange={(e) => setForm((v) => ({ ...v, invitee_email: e.target.value }))} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Selected time</span>
          <Input readOnly value={form.start_time ? new Date(form.start_time).toLocaleString() : "Choose a slot first"} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Notes</span>
          <Textarea rows={4} value={form.notes} onChange={(e) => setForm((v) => ({ ...v, notes: e.target.value }))} />
        </label>
        <div className="flex justify-end">
          <Button disabled={saving || !form.start_time}>{saving ? "Booking..." : "Confirm booking"}</Button>
        </div>
      </div>
    </form>
  );
}
