"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getBooking, type MeetingDto, type PublicEventTypeDto } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

type BookingDetails = MeetingDto & { event_type: PublicEventTypeDto };

export default function ConfirmedPage() {
  const params = useParams<{ username: string; slug: string }>();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meetingId");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingId) return;
    getBooking(meetingId)
      .then(setBooking)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load booking"));
  }, [meetingId]);

  if (!meetingId) return <main className="min-h-screen bg-slate-50 p-6 text-rose-700">Missing meeting id.</main>;
  if (error) return <main className="min-h-screen bg-slate-50 p-6 text-rose-700">{error}</main>;
  if (!booking) return <main className="min-h-screen bg-slate-50 p-6 text-slate-500">Loading confirmation...</main>;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] p-6">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-white/80 bg-white/85 p-8 shadow-[0_30px_80px_rgba(70,90,128,0.14)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500">Booking confirmed</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">You’re all set.</h1>
        <p className="mt-3 text-slate-500">A confirmation email will be sent when SMTP is configured. For now, your booking is stored in the system.</p>
        <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/80 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-500">Event</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{booking.event_type.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Host</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{booking.event_type.user.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Date & time</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatDateTime(booking.start_time)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Invitee</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{booking.invitee_name}</p>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <Link href={`/${params.username}/${params.slug}`} className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">
            Book another time
          </Link>
        </div>
      </div>
    </main>
  );
}
