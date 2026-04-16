import Link from "next/link";
import type { EventTypeDto } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function EventTypeCard({
  eventType,
  onDelete,
}: {
  eventType: EventTypeDto;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: eventType.color }} />
            <Badge>{eventType.duration} min</Badge>
            <Badge>{eventType.is_active ? "Active" : "Hidden"}</Badge>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">{eventType.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{eventType.description || "No description yet."}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            /alex/{eventType.slug}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/alex/${eventType.slug}`} className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">
          View booking page
        </Link>
        <Link href={`/event-types/${eventType.id}/edit`} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">
          Edit
        </Link>
        {onDelete ? (
          <Button variant="danger" onClick={() => onDelete(eventType.id)}>
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}
