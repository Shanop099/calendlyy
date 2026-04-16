"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  MessageSquare,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { cancelMeeting, getMeetings, type EventTypeDto } from "@/lib/api";

type CalendarLandingProps = {
  eventTypes?: EventTypeDto[];
};

type ViewMode = "day" | "week" | "month";
type EventCategory = "work" | "personal" | "wellness" | "social";

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  calendar: string;
  category: EventCategory;
  notes?: string;
  completed?: boolean;
  source: "backend" | "local";
  status?: string;
};

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const railIcons = [LayoutGrid, CalendarDays, PanelLeft, Users, MessageSquare, Settings];
const defaultCalendars = [
  { id: "esther", label: "Esther Howard", color: "#2d6df6" },
  { id: "tasks", label: "Tasks", color: "#f59e0b" },
  { id: "bootcamp", label: "Bootcamp", color: "#10b981" },
  { id: "birthdays", label: "Birthdays", color: "#f97316" },
];
const categoryBorder: Record<EventCategory, string> = {
  work: "border-l-[#2d6df6]",
  personal: "border-l-[#f59e0b]",
  wellness: "border-l-[#10b981]",
  social: "border-l-[#f97316]",
};

const initialEvents: EventItem[] = [
  { id: "evt-1", title: "Go-to-market sync", date: "2023-08-01", time: "13:00", calendar: "esther", category: "social", source: "local" },
  { id: "evt-2", title: "Design critique", date: "2023-08-03", time: "13:00", calendar: "esther", category: "work", source: "local" },
  { id: "evt-3", title: "Weekly roadmap", date: "2023-08-03", time: "15:30", calendar: "tasks", category: "work", source: "local" },
  { id: "evt-4", title: "Lunch with client", date: "2023-08-05", time: "19:30", calendar: "birthdays", category: "personal", source: "local" },
  { id: "evt-5", title: "Weekly planning", date: "2023-08-08", time: "07:30", calendar: "esther", category: "work", source: "local" },
  { id: "evt-6", title: "P2P Zoom", date: "2023-08-09", time: "09:00", calendar: "tasks", category: "work", source: "local" },
  { id: "evt-7", title: "Group workout", date: "2023-08-10", time: "10:10", calendar: "bootcamp", category: "wellness", source: "local" },
  { id: "evt-8", title: "Breakfast meetup", date: "2023-08-11", time: "07:30", calendar: "birthdays", category: "personal", source: "local" },
  { id: "evt-9", title: "Prototype review", date: "2023-08-12", time: "08:45", calendar: "esther", category: "work", source: "local" },
  { id: "evt-10", title: "Reunion dinner", date: "2023-08-12", time: "17:50", calendar: "birthdays", category: "social", source: "local" },
  { id: "evt-11", title: "Lunch meetup", date: "2023-08-17", time: "12:30", calendar: "tasks", category: "personal", source: "local" },
  { id: "evt-12", title: "Design check-in", date: "2023-08-25", time: "10:30", calendar: "esther", category: "work", source: "local" },
  { id: "evt-13", title: "Weekly recap", date: "2023-08-25", time: "13:50", calendar: "tasks", category: "work", source: "local" },
  { id: "evt-14", title: "Breakfast run", date: "2023-08-30", time: "07:30", calendar: "bootcamp", category: "wellness", source: "local" },
];

function formatDateKey(date: Date) {
  return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, "0"), `${date.getDate()}`.padStart(2, "0")].join("-");
}

function formatMonthYear(date: Date) {
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function formatReadableDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${monthNames[month - 1]} ${day}, ${year}`;
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${`${minutes}`.padStart(2, "0")} ${suffix}`;
}

function getCalendarMatrix(currentDate: Date) {
  const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const visibleStart = new Date(first);
  visibleStart.setDate(visibleStart.getDate() - visibleStart.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(visibleStart);
    day.setDate(visibleStart.getDate() + index);
    return day;
  });
}

function getCategoryFromEventType(eventType: EventTypeDto): EventCategory {
  const name = eventType.name.toLowerCase();
  if (name.includes("chat") || name.includes("coffee")) return "social";
  if (name.includes("deep") || name.includes("focus")) return "personal";
  return "work";
}

function toDateParts(iso: string) {
  const date = new Date(iso);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

export function CalendarLanding({ eventTypes }: CalendarLandingProps) {
  const [activeView, setActiveView] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date(2023, 7, 9));
  const [selectedDate, setSelectedDate] = useState("2023-08-09");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, boolean>>({ esther: true, tasks: true, bootcamp: true, birthdays: true });
  const [calendarOptions, setCalendarOptions] = useState(defaultCalendars);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [showComposer, setShowComposer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<EventItem>({
    id: "",
    title: "",
    date: "2023-08-09",
    time: "09:00",
    calendar: "esther",
    category: "work",
    notes: "",
    source: "local",
  });

  useEffect(() => {
    if (!eventTypes || eventTypes.length === 0) return;

    const backendCalendars = eventTypes.map((eventType) => ({
      id: eventType.id,
      label: eventType.name,
      color: eventType.color || "#2d6df6",
    }));

    const validCalendarIds = new Set(backendCalendars.map((calendar) => calendar.id));

    setCalendarOptions(backendCalendars);
    setFilters((current) => {
      const next: Record<string, boolean> = {};
      backendCalendars.forEach((calendar) => {
        next[calendar.id] = current[calendar.id] ?? true;
      });
      return next;
    });
    setDraft((current) => ({
      ...current,
      calendar: validCalendarIds.has(current.calendar) ? current.calendar : backendCalendars[0].id,
    }));
    setEvents((current) =>
      current.filter((event) => event.source !== "backend" || validCalendarIds.has(event.calendar)),
    );
  }, [eventTypes]);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const meetings = await getMeetings();
        if (ignore) return;

        const backendEvents: EventItem[] = meetings.map((meeting) => {
          const dateParts = toDateParts(meeting.start_time);
          return {
            id: meeting.id,
            title: meeting.invitee_name,
            date: dateParts.date,
            time: dateParts.time,
            calendar: meeting.event_type.id,
            category: getCategoryFromEventType(meeting.event_type),
            notes: meeting.notes ?? `${meeting.invitee_email} · ${meeting.event_type.name}`,
            completed: meeting.status === "cancelled",
            source: "backend",
            status: meeting.status,
          };
        });

        setEvents((current) => [...backendEvents, ...current.filter((event) => event.source === "local")]);
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : "Failed to load dashboard data");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const matrix = useMemo(() => getCalendarMatrix(currentDate), [currentDate]);
  const visibleLimit = activeView === "day" ? 6 : activeView === "week" ? 3 : 2;
  const todayKey = formatDateKey(new Date());

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((event) => filters[event.calendar] ?? true)
      .filter((event) => !q || `${event.title} ${event.notes ?? ""}`.toLowerCase().includes(q));
  }, [events, filters, query]);

  const eventsByDate = useMemo(() => {
    return filteredEvents.reduce<Record<string, EventItem[]>>((acc, event) => {
      const list = acc[event.date] ?? [];
      list.push(event);
      list.sort((a, b) => a.time.localeCompare(b.time));
      acc[event.date] = list;
      return acc;
    }, {});
  }, [filteredEvents]);

  const selectedEvents = eventsByDate[selectedDate] ?? [];

  function shiftMonth(amount: number) {
    setCurrentDate((value) => new Date(value.getFullYear(), value.getMonth() + amount, 1));
  }

  function goToToday() {
    const now = new Date();
    const dateKey = formatDateKey(now);
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(dateKey);
    setDraft((value) => ({ ...value, date: dateKey }));
  }

  function chooseDate(date: Date) {
    const dateKey = formatDateKey(date);
    setSelectedDate(dateKey);
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setDraft((value) => ({ ...value, date: dateKey }));
  }

  function submitEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setEvents((value) => [
      ...value,
      {
        ...draft,
        id: `evt-${Date.now()}`,
        title: draft.title.trim(),
        notes: draft.notes?.trim(),
        completed: false,
      },
    ]);
    const [year, month] = draft.date.split("-").map(Number);
    setSelectedDate(draft.date);
    setCurrentDate(new Date(year, month - 1, 1));
    setShowComposer(false);
    setDraft({ id: "", title: "", date: draft.date, time: "09:00", calendar: calendarOptions[0]?.id ?? "esther", category: "work", notes: "", source: "local" });
  }

  function toggleCompleted(id: string) {
    setEvents((value) =>
      value.map((item) =>
        item.id === id && item.source === "local" ? { ...item, completed: !item.completed } : item,
      ),
    );
  }

  async function removeEvent(id: string) {
    const target = events.find((item) => item.id === id);
    if (!target) return;

    if (target.source === "backend") {
      try {
        await cancelMeeting(id, "Cancelled from dashboard");
        setEvents((value) =>
          value.map((item) =>
            item.id === id
              ? {
                  ...item,
                  completed: true,
                  status: "cancelled",
                  notes: item.notes ?? "Cancelled from dashboard",
                }
              : item,
          ),
        );
        return;
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Failed to cancel meeting");
        return;
      }
    }

    setEvents((value) => value.filter((item) => item.id !== id));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(45,109,246,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] p-4 text-slate-900 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-[84px_minmax(0,1fr)]">
        <aside className="flex flex-row items-center justify-between rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-[0_30px_80px_rgba(70,90,128,0.14)] backdrop-blur-xl lg:flex-col lg:justify-start lg:gap-7">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0f172a,#2d6df6)] text-xl font-extrabold text-white">C</div>
          <nav className="flex flex-row gap-3 lg:flex-col" aria-label="Primary">
            {railIcons.map((Icon, index) => (
              <button key={index} type="button" className={`grid h-12 w-12 place-items-center rounded-2xl transition ${index === 1 ? "bg-blue-50 text-[#2d6df6]" : "text-slate-400 hover:bg-slate-100"}`}>
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </nav>
        </aside>

        <section className="overflow-hidden rounded-[34px] border border-white/80 bg-white/72 shadow-[0_30px_80px_rgba(70,90,128,0.14)] backdrop-blur-xl">
          <header className="grid grid-cols-1 gap-4 border-b border-slate-200 px-5 py-5 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center xl:px-8">
            <div className="inline-flex w-fit gap-2 rounded-2xl bg-slate-100/90 p-1.5">
              {(["day", "week", "month"] as ViewMode[]).map((view) => (
                <button key={view} type="button" onClick={() => setActiveView(view)} className={`rounded-xl px-4 py-2.5 text-sm font-bold capitalize transition ${activeView === view ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                  {view}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-400 ring-1 ring-transparent transition focus-within:ring-blue-200">
              <Search className="h-4 w-4" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search for anything" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
            </label>

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <button type="button" className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50 text-slate-500"><Bell className="h-4 w-4" /></button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-50 text-slate-500"><MessageSquare className="h-4 w-4" /></button>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#ffd7ca,#ffe4b3)] text-sm font-extrabold text-amber-950">EH</div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Esther Howard</p>
                  <span className="text-xs text-slate-500">esther.howard@syncmail.com</span>
                </div>
              </div>
            </div>
          </header>

          <div className="grid min-h-[calc(100vh-10rem)] grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-white/20 px-5 py-6 xl:border-b-0 xl:border-r xl:px-6">
              <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold">{formatMonthYear(currentDate)}</h2>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => shiftMonth(-1)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500"><ChevronLeft className="h-4 w-4" /></button>
                    <button type="button" onClick={() => shiftMonth(1)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {matrix.map((date) => {
                    const dateKey = formatDateKey(date);
                    const selected = dateKey === selectedDate;
                    const inMonth = date.getMonth() === currentDate.getMonth();
                    const hasEvents = (eventsByDate[dateKey] ?? []).length > 0;
                    return (
                      <button key={dateKey} type="button" onClick={() => chooseDate(date)} className={`relative grid h-10 place-items-center rounded-2xl text-sm font-bold transition ${selected ? "bg-[linear-gradient(135deg,#2d6df6,#69a1ff)] text-white shadow-[0_16px_30px_rgba(45,109,246,0.32)]" : inMonth ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:bg-slate-50"}`}>
                        {date.getDate()}
                        {!selected && hasEvents ? <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-[#2d6df6]" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">Scheduled</h3>
                <button type="button" onClick={() => setShowComposer(true)} className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-[#2d6df6]"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 rounded-[22px] border border-slate-200 bg-white/85 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Selected date</p>
                <strong className="mt-2 block text-lg font-extrabold text-slate-900">{formatReadableDate(selectedDate)}</strong>
                <span className="mt-1 block text-sm text-slate-500">{selectedEvents.length === 1 ? "1 event planned" : `${selectedEvents.length} events planned`}</span>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">My Calendars</h3>
                  <span className="rounded-xl bg-slate-100 px-2 py-1 text-slate-500">...</span>
                </div>
                <div className="mt-3 space-y-3">
                  {calendarOptions.map((calendar) => (
                    <label key={calendar.id} className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
                      <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <input type="checkbox" checked={filters[calendar.id] ?? true} onChange={() => setFilters((value) => ({ ...value, [calendar.id]: !value[calendar.id] }))} className="h-4 w-4 rounded border-slate-300 text-[#2d6df6] focus:ring-[#2d6df6]" />
                        {calendar.label}
                      </span>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: calendar.color }} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">Categories</h3>
                  <span className="rounded-xl bg-slate-100 px-2 py-1 text-slate-500">...</span>
                </div>
                <div className="mt-3 space-y-3 text-sm text-slate-500">
                  <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#2d6df6]" />Work</div>
                  <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />Personal</div>
                  <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />Wellness</div>
                  <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />Social</div>
                </div>
              </div>
            </aside>

            <section className="px-4 py-6 sm:px-6 xl:px-6">
              {loadError ? (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {loadError}
                </div>
              ) : null}

              {isLoading ? (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Loading meetings from backend...
                </div>
              ) : null}

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Unified schedule</p>
                  <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{formatMonthYear(currentDate)}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={goToToday} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">Today</button>
                  <button type="button" className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500"><ListFilter className="h-4 w-4" /></button>
                  <button type="button" className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500"><PanelLeft className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setShowComposer(true)} className="rounded-2xl bg-[linear-gradient(135deg,#2d6df6,#5a93ff)] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_35px_rgba(45,109,246,0.24)]">+ Add Schedule</button>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white/88">
                <div className="grid grid-cols-7 bg-slate-50/90 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {weekdays.map((day) => <span key={day} className="border-r border-slate-200 px-4 py-4 last:border-r-0">{day}</span>)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-7">
                  {matrix.map((date) => {
                    const dateKey = formatDateKey(date);
                    const dayEvents = eventsByDate[dateKey] ?? [];
                    const currentMonth = date.getMonth() === currentDate.getMonth();
                    return (
                      <article key={dateKey} className={`min-h-[138px] border-r border-t border-slate-200 p-3 last:border-r-0 ${dateKey === selectedDate ? "bg-blue-50/50" : "bg-white/70"} ${currentMonth ? "text-slate-800" : "text-slate-300"}`}>
                        <button type="button" onClick={() => chooseDate(date)} className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${dateKey === todayKey ? "bg-[#2d6df6] text-white" : "text-inherit"}`}>
                          {date.getDate()}
                        </button>
                        <div className="mt-3 space-y-2">
                          {dayEvents.slice(0, visibleLimit).map((item) => (
                            <div key={item.id} className={`rounded-2xl border border-slate-200 border-l-4 bg-slate-50/90 px-3 py-2 shadow-sm ${categoryBorder[item.category]} ${item.completed ? "opacity-60" : ""}`}>
                              <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{formatTime(item.time)}</span>
                              <span className={`block text-sm font-bold text-slate-800 ${item.completed ? "line-through" : ""}`}>{item.title}</span>
                              <span className="block text-xs text-slate-500">{calendarOptions.find((entry) => entry.id === item.calendar)?.label}</span>
                            </div>
                          ))}
                          {dayEvents.length > visibleLimit ? <span className="block text-xs font-semibold text-slate-400">+{dayEvents.length - visibleLimit} more</span> : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-200 bg-white/90 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Day agenda</p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">{formatReadableDate(selectedDate)}</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    {selectedEvents.length} {selectedEvents.length === 1 ? "task" : "tasks"}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedEvents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-sm text-slate-500">
                      No tasks on this date yet. Use Add Schedule to create one.
                    </div>
                  ) : (
                    selectedEvents.map((item) => (
                      <div key={`agenda-${item.id}`} className="flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <button
                          type="button"
                          onClick={() => toggleCompleted(item.id)}
                          className={`mt-0.5 grid h-6 w-6 place-items-center rounded-full border text-xs font-bold ${
                            item.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-slate-400"
                          }`}
                          aria-label={item.completed ? "Mark as not done" : "Mark as done"}
                        >
                          {item.completed ? "✓" : ""}
                        </button>

                        <div className="min-w-[220px] flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{formatTime(item.time)}</span>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: calendarOptions.find((entry) => entry.id === item.calendar)?.color }} />
                            <span className="text-xs font-semibold text-slate-500">{calendarOptions.find((entry) => entry.id === item.calendar)?.label}</span>
                          </div>
                          <p className={`mt-1 text-sm font-bold text-slate-900 ${item.completed ? "line-through text-slate-400" : ""}`}>
                            {item.title}
                          </p>
                          {item.notes ? (
                            <p className={`mt-1 text-sm text-slate-500 ${item.completed ? "line-through" : ""}`}>{item.notes}</p>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCompleted(item.id)}
                            disabled={item.source === "backend"}
                            className={`rounded-xl px-3 py-2 text-xs font-bold shadow-sm ring-1 ${
                              item.source === "backend"
                                ? "cursor-not-allowed bg-slate-100 text-slate-400 ring-slate-200"
                                : "bg-white text-slate-600 ring-slate-200"
                            }`}
                          >
                            {item.source === "backend" ? "Managed" : item.completed ? "Undo" : "Done"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeEvent(item.id)}
                            className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 ring-1 ring-rose-100"
                          >
                            {item.source === "backend" ? "Cancel" : "Remove"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>

      {showComposer ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(70,90,128,0.18)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Create event</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Add a new schedule item</h2>
              </div>
              <button type="button" onClick={() => setShowComposer(false)} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-500">x</button>
            </div>

            <form onSubmit={submitEvent} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Title</span>
                <input value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-200 focus:bg-white" placeholder="Weekly design critique" />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Date</span>
                  <input type="date" value={draft.date} onChange={(event) => setDraft((value) => ({ ...value, date: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-200 focus:bg-white" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Time</span>
                  <input type="time" value={draft.time} onChange={(event) => setDraft((value) => ({ ...value, time: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-200 focus:bg-white" />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Calendar</span>
                  <select value={draft.calendar} onChange={(event) => setDraft((value) => ({ ...value, calendar: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-200 focus:bg-white">
                    {calendarOptions.map((calendar) => <option key={calendar.id} value={calendar.id}>{calendar.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Category</span>
                  <select value={draft.category} onChange={(event) => setDraft((value) => ({ ...value, category: event.target.value as EventCategory }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-200 focus:bg-white">
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="wellness">Wellness</option>
                    <option value="social">Social</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Notes</span>
                <textarea value={draft.notes} onChange={(event) => setDraft((value) => ({ ...value, notes: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-200 focus:bg-white" placeholder="Add context, links, or agenda..." />
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowComposer(false)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">Cancel</button>
                <button type="submit" className="rounded-2xl bg-[linear-gradient(135deg,#2d6df6,#5a93ff)] px-5 py-3 text-sm font-bold text-white">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
