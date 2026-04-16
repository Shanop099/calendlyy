import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default user
  const user = await prisma.user.upsert({
    where: { username: 'alex' },
    update: {},
    create: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      username: 'alex',
      timezone: 'America/New_York',
    },
  });

  console.log('Created user:', user.username);

  // Create event types
  const eventTypes = [
    { name: '15 Min Quick Chat', slug: '15-min-chat', duration: 15, color: '#006BFF', description: 'A quick 15-minute catch-up.' },
    { name: '30 Min Meeting', slug: '30-min-meeting', duration: 30, color: '#0E8A16', description: 'A focused 30-minute discussion.' },
    { name: '60 Min Deep Dive', slug: '60-min-deep', duration: 60, color: '#8B5CF6', description: 'An in-depth 60-minute session.' },
  ];

  for (const et of eventTypes) {
    await prisma.eventType.upsert({
      where: { slug: et.slug },
      update: {},
      create: { ...et, user_id: user.id },
    });
  }

  console.log('Created event types');

  // Create availability schedule
  const schedule = await prisma.availabilitySchedule.upsert({
    where: { id: user.id }, // Use user id as a stable reference
    update: {},
    create: {
      id: user.id, // reuse user id as schedule id for simplicity in seed
      user_id: user.id,
      name: 'Working Hours',
      timezone: 'America/New_York',
      is_default: true,
    },
  });

  console.log('Created availability schedule');

  // Create availability rules (Mon=1 to Fri=5 available, Sat=6, Sun=0 off)
  const days = [
    { day_of_week: 0, is_available: false, start_time: '09:00:00', end_time: '17:00:00' },
    { day_of_week: 1, is_available: true, start_time: '09:00:00', end_time: '17:00:00' },
    { day_of_week: 2, is_available: true, start_time: '09:00:00', end_time: '17:00:00' },
    { day_of_week: 3, is_available: true, start_time: '09:00:00', end_time: '17:00:00' },
    { day_of_week: 4, is_available: true, start_time: '09:00:00', end_time: '17:00:00' },
    { day_of_week: 5, is_available: true, start_time: '09:00:00', end_time: '17:00:00' },
    { day_of_week: 6, is_available: false, start_time: '09:00:00', end_time: '17:00:00' },
  ];

  // Delete existing rules for this schedule
  await prisma.availabilityRule.deleteMany({ where: { schedule_id: schedule.id } });

  for (const rule of days) {
    await prisma.availabilityRule.create({
      data: { ...rule, schedule_id: schedule.id },
    });
  }

  console.log('Created availability rules');

  // Create sample meetings
  const eventType = await prisma.eventType.findFirst({ where: { slug: '30-min-meeting' } });
  if (eventType) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);

    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 5);
    lastWeek.setHours(11, 0, 0, 0);

    await prisma.meeting.createMany({
      data: [
        {
          event_type_id: eventType.id,
          invitee_name: 'Alice Smith',
          invitee_email: 'alice@example.com',
          start_time: tomorrow,
          end_time: new Date(tomorrow.getTime() + 30 * 60000),
          status: 'active',
          notes: 'Looking forward to connecting!',
        },
        {
          event_type_id: eventType.id,
          invitee_name: 'Bob Chen',
          invitee_email: 'bob@example.com',
          start_time: dayAfter,
          end_time: new Date(dayAfter.getTime() + 30 * 60000),
          status: 'active',
        },
        {
          event_type_id: eventType.id,
          invitee_name: 'Carol White',
          invitee_email: 'carol@example.com',
          start_time: lastWeek,
          end_time: new Date(lastWeek.getTime() + 30 * 60000),
          status: 'active',
        },
      ],
    });

    console.log('Created sample meetings');
  }

  console.log('Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());