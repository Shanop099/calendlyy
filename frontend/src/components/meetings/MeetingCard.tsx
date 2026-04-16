import type { MeetingDto } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function MeetingCard({
  meeting,
  onCancel,
}: {
  meeting: MeetingDto;
  onCancel?: (id: string) => void;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{meeting.event_type.name}</p>
          <h3 className="mt-1 text-lg font-extrabold text-slate-900">{meeting.invitee_name}</h3>
          <p className="mt-1 text-sm text-slate-500">{meeting.invitee_email}</p>
          <p className="mt-3 text-sm text-slate-600">{formatDateTime(meeting.start_time)}</p>
          {meeting.notes ? <p className="mt-2 text-sm text-slate-500">{meeting.notes}</p> : null}
        </div>
        <div className="text-right">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${meeting.status === "cancelled" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
            {meeting.status}
          </span>
          {onCancel && meeting.status !== "cancelled" ? (
            <div className="mt-4">
              <Button variant="danger" onClick={() => onCancel(meeting.id)}>Cancel meeting</Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
