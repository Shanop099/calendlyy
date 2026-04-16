"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import { CalendarPicker } from "@/components/booking/CalendarPicker";
import { TimeSlotList } from "@/components/booking/TimeSlotList";
import { bookPublicSlot, getPublicEventType, getPublicSlots, type PublicEventTypeDto, type SlotDto } from "@/lib/api";
import { formatDateOnly, toInputDate } from "@/lib/utils";

export default function PublicBookingPage() {
  const params = useParams<{ username: string; slug: string }>();
  const router = useRouter();
  const [eventType, setEventType] = useState<PublicEventTypeDto | null>(null);
  const [date, setDate] = useState(toInputDate(new Date()));
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicEventType(params.username, params.slug)
      .then(setEventType)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load event type"))
      .finally(() => setLoading(false));
  }, [params.slug, params.username]);

  useEffect(() => {
    setSlotLoading(true);
    getPublicSlots(params.username, params.slug, date)
      .then((value) => setSlots(value.slots))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load slots"))
      .finally(() => setSlotLoading(false));
  }, [date, params.slug, params.username]);

  if (loading) return <main className="min-h-screen bg-slate-50 p-6 text-slate-500">Loading booking page...</main>;
  if (error || !eventType) return <main className="min-h-screen bg-slate-50 p-6 text-rose-700">{error || "Page unavailable"}</main>;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] p-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-[0_30px_80px_rgba(70,90,128,0.14)]">
          <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: eventType.color }}>
            {eventType.duration} min
          </span>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900">{eventType.name}</h1>
          <p className="mt-3 max-w-2xl text-slate-500">{eventType.description || "Pick a time that works for you."}</p>
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
            <p className="text-sm font-semibold text-slate-500">Host</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{eventType.user.name}</p>
            <p className="mt-4 text-sm font-semibold text-slate-500">Selected date</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatDateOnly(date)}</p>
          </div>
        </section>

        <section className="space-y-4">
          <CalendarPicker value={date} onChange={setDate} />
          {slotLoading ? <div className="rounded-[28px] border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">Loading slots...</div> : null}
          {!slotLoading ? <TimeSlotList slots={slots} selected={selectedSlot?.start} onSelect={setSelectedSlot} /> : null}
          <BookingForm
            selectedStartTime={selectedSlot?.start}
            onSubmit={async (value) => {
              if (!selectedSlot) throw new Error("Please choose a slot first.");
              const booking = await bookPublicSlot(params.username, params.slug, {
                ...value,
                start_time: selectedSlot.start,
              });
              router.push(`/${params.username}/${params.slug}/confirmed?meetingId=${booking.meeting_id}`);
            }}
          />
        </section>
      </div>
    </main>
  );
}
