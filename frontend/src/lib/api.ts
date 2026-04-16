export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3001/api/v1";

export type EventTypeDto = {
  id: string;
  name: string;
  slug: string;
  duration: number;
  description?: string | null;
  color: string;
  is_active: boolean;
  location?: string | null;
};

export type EventTypeInput = {
  name: string;
  slug: string;
  duration: number;
  description?: string;
  color?: string;
  is_active?: boolean;
  location?: string;
};

export type MeetingDto = {
  id: string;
  invitee_name: string;
  invitee_email: string;
  start_time: string;
  end_time: string;
  status: string;
  cancel_reason?: string | null;
  notes?: string | null;
  event_type: EventTypeDto;
};

export type AvailabilityRuleDto = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

export type AvailabilityResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    timezone: string;
  };
  schedule: {
    id: string;
    timezone: string;
    name: string;
    rules: AvailabilityRuleDto[];
  } | null;
};

export type PublicEventTypeDto = EventTypeDto & {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    timezone: string;
  };
};

export type SlotDto = {
  start: string;
  end: string;
};

export type BookingInput = {
  invitee_name: string;
  invitee_email: string;
  start_time: string;
  notes?: string;
};

export type BookingConfirmationDto = {
  meeting_id: string;
  start_time: string;
  end_time: string;
  event_type: string;
  status: string;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || `Request failed: ${response.status}`;

    try {
      const parsed = JSON.parse(text) as { error?: string };
      message = parsed.error || message;
    } catch {
      // keep raw text fallback
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getEventTypes() {
  return apiFetch<EventTypeDto[]>("/event-types");
}

export function getEventTypeById(id: string) {
  return apiFetch<EventTypeDto>(`/event-types/${id}`);
}

export function createEventType(payload: EventTypeInput) {
  return apiFetch<EventTypeDto>("/event-types", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateEventType(id: string, payload: Partial<EventTypeInput>) {
  return apiFetch<EventTypeDto>(`/event-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteEventType(id: string) {
  return apiFetch<void>(`/event-types/${id}`, {
    method: "DELETE",
  });
}

export function getAvailability() {
  return apiFetch<AvailabilityResponse>("/availability");
}

export function updateAvailability(payload: {
  timezone?: string;
  rules: AvailabilityRuleDto[];
}) {
  return apiFetch<AvailabilityResponse["schedule"]>("/availability", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getMeetings(filter?: "upcoming" | "past") {
  const suffix = filter ? `?filter=${filter}` : "";
  return apiFetch<MeetingDto[]>(`/meetings${suffix}`);
}

export function cancelMeeting(id: string, reason?: string) {
  return apiFetch<MeetingDto>(`/meetings/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export function getPublicEventType(username: string, slug: string) {
  return apiFetch<PublicEventTypeDto>(`/public/${username}/${slug}`);
}

export function getPublicSlots(username: string, slug: string, date: string) {
  return apiFetch<{ slots: SlotDto[] }>(`/public/${username}/${slug}/slots?date=${date}`);
}

export function bookPublicSlot(username: string, slug: string, payload: BookingInput) {
  return apiFetch<BookingConfirmationDto>(`/public/${username}/${slug}/book`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getBooking(meetingId: string) {
  return apiFetch<MeetingDto & { event_type: PublicEventTypeDto }>(`/public/booking/${meetingId}`);
}
