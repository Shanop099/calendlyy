"use client";

import { useState } from "react";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { Button } from "@/components/ui/Button";
import { useMeetings } from "@/hooks/useMeetings";
import { cancelMeeting } from "@/lib/api";

export default function MeetingsPage() {
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const { data, loading, error, setData } = useMeetings(filter);

  async function handleCancel(id: string) {
    const updated = await cancelMeeting(id, "Cancelled from meetings dashboard");
    setData((current) => current.map((meeting) => (meeting.id === id ? updated : meeting)));
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Meetings</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Manage your schedule</h1>
          </div>
          <div className="inline-flex gap-2 rounded-2xl bg-slate-100 p-1.5">
            <Button variant={filter === "upcoming" ? "primary" : "ghost"} onClick={() => setFilter("upcoming")}>Upcoming</Button>
            <Button variant={filter === "past" ? "primary" : "ghost"} onClick={() => setFilter("past")}>Past</Button>
          </div>
        </div>
        {loading ? <div className="mt-6 text-slate-500">Loading meetings...</div> : null}
        {error ? <div className="mt-6 text-rose-700">{error}</div> : null}
        <div className="mt-6 grid gap-4">
          {data.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} onCancel={filter === "upcoming" ? handleCancel : undefined} />
          ))}
        </div>
      </div>
    </main>
  );
}
