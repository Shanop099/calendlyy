import prisma from '../utils/prisma';

export async function getDefaultUser() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error('No default user seeded in database.');
  return user;
}

export async function listEventTypes(userId: string) {
  return prisma.eventType.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'asc' },
  });
}

export async function getEventTypeById(id: string) {
  return prisma.eventType.findUnique({ where: { id } });
}

export async function createEventType(userId: string, data: {
  name: string;
  slug: string;
  duration: number;
  description?: string;
  color?: string;
  is_active?: boolean;
  location?: string;
}) {
  const existing = await prisma.eventType.findUnique({ where: { slug: data.slug } });
  if (existing) throw Object.assign(new Error('Slug already taken'), { code: 'SLUG_TAKEN' });

  return prisma.eventType.create({ data: { ...data, user_id: userId } });
}

export async function updateEventType(id: string, data: Partial<{
  name: string;
  slug: string;
  duration: number;
  description: string;
  color: string;
  is_active: boolean;
  location: string;
}>) {
  return prisma.eventType.update({ where: { id }, data });
}

export async function deleteEventType(id: string) {
  const now = new Date();

  const activeMeetingsCount = await prisma.meeting.count({
    where: {
      event_type_id: id,
      status: 'active',
      start_time: { gte: now },
    },
  });

  if (activeMeetingsCount > 0) {
    throw Object.assign(
      new Error('This event type still has upcoming active meetings. Cancel those meetings before deleting it.'),
      { code: 'EVENT_TYPE_IN_USE' },
    );
  }

  return prisma.$transaction(async (tx) => {
    // Keep delete semantics simple for clients: if no upcoming active bookings,
    // remove historical/cancelled meetings and then remove the event type.
    await tx.meeting.deleteMany({ where: { event_type_id: id } });
    return tx.eventType.delete({ where: { id } });
  });
}
