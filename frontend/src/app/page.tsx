"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarLanding } from "@/components/landing/CalendarLanding";
import { EventTypeCard } from "@/components/event-types/EventTypeCard";
import { Button } from "@/components/ui/Button";
import { deleteEventType } from "@/lib/api";
import { useEventTypes } from "@/hooks/useEventTypes";

export default function HomePage() {
  const { data, loading, error, setData } = useEventTypes();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      setActionError(null);
      await deleteEventType(id);
      setData((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to delete event type");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Admin dashboard</p>
              <h1 className="mt-2 text-4xl font-extrabold text-slate-900">Calendly clone workspace</h1>
              <p className="mt-3 max-w-2xl text-slate-500">
                Manage event types, availability, meetings, and your live scheduling dashboard from one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/event-types/new"><Button>Create event type</Button></Link>
              <Link href="/availability"><Button variant="secondary">Availability</Button></Link>
              <Link href="/meetings"><Button variant="secondary">Meetings</Button></Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Link href="/availability" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-900">Availability</p>
              <p className="mt-2 text-sm text-slate-500">Update your timezone and weekly working hours.</p>
            </Link>
            <Link href="/meetings" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-900">Meetings</p>
              <p className="mt-2 text-sm text-slate-500">Review upcoming calls and cancel bookings when needed.</p>
            </Link>
            <Link href="/alex/30-min-meeting" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-900">Public booking</p>
              <p className="mt-2 text-sm text-slate-500">Open the live booking flow powered by your backend slots API.</p>
            </Link>
          </div>

          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Event types</p>
                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Booking templates</h2>
              </div>
              {deletingId ? <span className="text-sm text-slate-500">Updating...</span> : null}
            </div>
            {loading ? <div className="text-slate-500">Loading event types...</div> : null}
            {error ? <div className="text-rose-700">{error}</div> : null}
            {actionError ? <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{actionError}</div> : null}
            <div className="grid gap-4 lg:grid-cols-3">
              {data.map((eventType) => (
                <EventTypeCard key={eventType.id} eventType={eventType} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <CalendarLanding eventTypes={data} />
      </section>
    </div>
  );
}
