"use client";

import { useState } from "react";
import type { EventTypeDto, EventTypeInput } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

const defaultValues: EventTypeInput = {
  name: "",
  slug: "",
  duration: 30,
  description: "",
  color: "#2d6df6",
  is_active: true,
  location: "",
};

export function EventTypeForm({
  initialValue,
  onSubmit,
  submitLabel,
}: {
  initialValue?: Partial<EventTypeDto>;
  onSubmit: (value: EventTypeInput) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<EventTypeInput>({
    ...defaultValues,
    ...initialValue,
    description: initialValue?.description ?? "",
    location: initialValue?.location ?? "",
    color: initialValue?.color ?? "#2d6df6",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await onSubmit({
        ...form,
        slug: form.slug || slugify(form.name),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save event type");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Name</span>
          <Input value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value, slug: slugify(e.target.value) }))} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Slug</span>
          <Input value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: slugify(e.target.value) }))} />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Duration</span>
          <Input type="number" min={15} step={15} value={form.duration} onChange={(e) => setForm((v) => ({ ...v, duration: Number(e.target.value) }))} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Color</span>
          <Input type="color" value={form.color} onChange={(e) => setForm((v) => ({ ...v, color: e.target.value }))} className="h-[50px]" />
        </label>
        <label className="flex items-center gap-3 pt-8 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((v) => ({ ...v, is_active: e.target.checked }))} />
          Active
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Location</span>
        <Input value={form.location} onChange={(e) => setForm((v) => ({ ...v, location: e.target.value }))} placeholder="Google Meet, Zoom, Office..." />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Description</span>
        <Textarea rows={4} value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} />
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : submitLabel}</Button>
      </div>
    </form>
  );
}
