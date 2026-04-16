"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EventTypeForm } from "@/components/event-types/EventTypeForm";
import { getEventTypeById, updateEventType, type EventTypeDto } from "@/lib/api";

export default function EditEventTypePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [eventType, setEventType] = useState<EventTypeDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEventTypeById(params.id)
      .then(setEventType)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load event type"));
  }, [params.id]);

  if (error) {
    return <main className="min-h-screen bg-slate-50 p-6 text-rose-700">{error}</main>;
  }

  if (!eventType) {
    return <main className="min-h-screen bg-slate-50 p-6 text-slate-500">Loading event type...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Event types</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Edit {eventType.name}</h1>
        <div className="mt-6">
          <EventTypeForm
            initialValue={eventType}
            submitLabel="Save changes"
            onSubmit={async (value) => {
              await updateEventType(params.id, value);
              router.push("/");
            }}
          />
        </div>
      </div>
    </main>
  );
}
