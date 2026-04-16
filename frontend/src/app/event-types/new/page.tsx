"use client";

import { useRouter } from "next/navigation";
import { createEventType } from "@/lib/api";
import { EventTypeForm } from "@/components/event-types/EventTypeForm";

export default function NewEventTypePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Event types</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Create a new event type</h1>
        <div className="mt-6">
          <EventTypeForm
            submitLabel="Create event type"
            onSubmit={async (value) => {
              await createEventType(value);
              router.push("/");
            }}
          />
        </div>
      </div>
    </main>
  );
}
