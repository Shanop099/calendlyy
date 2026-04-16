import prisma from '../utils/prisma';

export async function getAvailability(userId: string) {
  return prisma.availabilitySchedule.findFirst({
    where: { user_id: userId, is_default: true },
    include: { rules: { orderBy: { day_of_week: 'asc' } } },
  });
}

export async function upsertAvailability(
  userId: string,
  timezone: string | undefined,
  rules: { day_of_week: number; start_time: string; end_time: string; is_available: boolean }[]
) {
  let schedule = await prisma.availabilitySchedule.findFirst({
    where: { user_id: userId, is_default: true },
  });

  if (!schedule) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    schedule = await prisma.availabilitySchedule.create({
      data: {
        user_id: userId,
        name: 'Working Hours',
        timezone: timezone || user?.timezone || 'UTC',
        is_default: true,
      },
    });
  } else if (timezone) {
    schedule = await prisma.availabilitySchedule.update({
      where: { id: schedule.id },
      data: { timezone },
    });
  }

  if (timezone) {
    await prisma.user.update({ where: { id: userId }, data: { timezone } });
  }

  await prisma.availabilityRule.deleteMany({ where: { schedule_id: schedule.id } });
  await prisma.availabilityRule.createMany({
    data: rules.map((r) => ({ ...r, schedule_id: schedule!.id })),
  });

  return prisma.availabilitySchedule.findUnique({
    where: { id: schedule.id },
    include: { rules: { orderBy: { day_of_week: 'asc' } } },
  });
}