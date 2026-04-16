import prisma from './prisma';

export async function getAvailableSlots(
  username: string,
  slug: string,
  dateStr: string
): Promise<{ start: string; end: string }[]> {
  // Find event type
  const eventType = await prisma.eventType.findFirst({
    where: { slug, user: { username }, is_active: true },
    include: { user: true },
  });

  if (!eventType) return [];

  // Parse the requested date
  const [year, month, day] = dateStr.split('-').map(Number);
  const requestedDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = requestedDate.getUTCDay(); // 0=Sun, 6=Sat

  // Get default schedule for the user
  const schedule = await prisma.availabilitySchedule.findFirst({
    where: { user_id: eventType.user_id, is_default: true },
    include: { rules: true },
  });

  if (!schedule) return [];

  // Find rule for this day of week
  const rule = schedule.rules.find((r) => r.day_of_week === dayOfWeek);
  if (!rule || !rule.is_available) return [];

  // Generate all possible slots
  const [startH, startM] = rule.start_time.split(':').map(Number);
  const [endH, endM] = rule.end_time.split(':').map(Number);

  const slotStartMs = startH * 60 + startM; // minutes from midnight
  const slotEndMs = endH * 60 + endM;
  const duration = eventType.duration;

  const slots: { start: Date; end: Date }[] = [];
  let current = slotStartMs;

  while (current + duration <= slotEndMs) {
    const slotStart = new Date(requestedDate);
    slotStart.setUTCHours(Math.floor(current / 60), current % 60, 0, 0);

    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    slots.push({ start: slotStart, end: slotEnd });
    current += duration;
  }

  // Filter out past slots (add 15min buffer)
  const now = new Date(Date.now() + 15 * 60000);
  const futureSlots = slots.filter((s) => s.start > now);

  // Get existing meetings that overlap with any slot in this range
  if (futureSlots.length === 0) return [];

  const dayStart = futureSlots[0].start;
  const dayEnd = futureSlots[futureSlots.length - 1].end;

  const existingMeetings = await prisma.meeting.findMany({
    where: {
      event_type: { user_id: eventType.user_id },
      status: 'active',
      start_time: { lt: dayEnd },
      end_time: { gt: dayStart },
    },
  });

  // Filter out conflicting slots
  const availableSlots = futureSlots.filter((slot) => {
    return !existingMeetings.some(
      (m) => m.start_time < slot.end && m.end_time > slot.start
    );
  });

  return availableSlots.map((s) => ({
    start: s.start.toISOString(),
    end: s.end.toISOString(),
  }));
}