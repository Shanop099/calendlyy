import prisma from '../utils/prisma';

export async function listMeetings(userId: string, filter?: string) {
  const now = new Date();

  if (filter === 'upcoming') {
    return prisma.meeting.findMany({
      where: { event_type: { user_id: userId }, status: 'active', start_time: { gte: now } },
      include: { event_type: true },
      orderBy: { start_time: 'asc' },
    });
  }

  if (filter === 'past') {
    return prisma.meeting.findMany({
      where: {
        event_type: { user_id: userId },
        OR: [{ start_time: { lt: now } }, { status: 'cancelled' }],
      },
      include: { event_type: true },
      orderBy: { start_time: 'desc' },
    });
  }

  // default: all
  return prisma.meeting.findMany({
    where: { event_type: { user_id: userId } },
    include: { event_type: true },
    orderBy: { start_time: 'desc' },
  });
}

export async function getMeetingById(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: { event_type: { include: { user: true } } },
  });
}

export async function cancelMeeting(id: string, reason?: string) {
  return prisma.meeting.update({
    where: { id },
    data: { status: 'cancelled', cancel_reason: reason ?? null },
    include: { event_type: true },
  });
}