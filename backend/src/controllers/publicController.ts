import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { getAvailableSlots } from '../utils/slots';
import { sendBookingConfirmationToInvitee, sendBookingNotificationToHost } from '../services/emailService';

export async function getEventType(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, slug } = req.params;
    const eventType = await prisma.eventType.findFirst({
      where: { slug, user: { username }, is_active: true },
      include: { user: true },
    });
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });
    res.json(eventType);
  } catch (err) { next(err); }
}

export async function getSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, slug } = req.params;
    const date = req.query.date as string;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });
    }
    const slots = await getAvailableSlots(username, slug, date);
    res.json({ slots });
  } catch (err) { next(err); }
}

const bookSchema = z.object({
  invitee_name: z.string().min(1).max(255),
  invitee_email: z.string().email(),
  start_time: z.string().datetime(),
  notes: z.string().max(1000).optional(),
});

export async function book(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, slug } = req.params;
    const { invitee_name, invitee_email, start_time, notes } = bookSchema.parse(req.body);

    const eventType = await prisma.eventType.findFirst({
      where: { slug, user: { username }, is_active: true },
      include: { user: true },
    });
    if (!eventType) return res.status(404).json({ error: 'Event type not found' });

    const start = new Date(start_time);
    const end = new Date(start.getTime() + eventType.duration * 60000);

    // Double-booking prevention
    const conflict = await prisma.meeting.findFirst({
      where: {
        event_type: { user: { username } },
        status: 'active',
        start_time: { lt: end },
        end_time: { gt: start },
      },
    });
    if (conflict) return res.status(409).json({ error: 'This time slot is no longer available. Please pick another.' });

    const meeting = await prisma.meeting.create({
      data: { event_type_id: eventType.id, invitee_name, invitee_email, start_time: start, end_time: end, notes },
    });

    // Send emails (non-blocking — failures don't break the booking)
    const emailData = {
      invitee_name,
      invitee_email,
      event_name: eventType.name,
      start_time: start,
      end_time: end,
      host_name: eventType.user.name,
      host_email: eventType.user.email,
      location: eventType.location ?? undefined,
      meeting_id: meeting.id,
    };
    sendBookingConfirmationToInvitee(emailData).catch(console.error);
    sendBookingNotificationToHost(emailData).catch(console.error);

    res.status(201).json({
      meeting_id: meeting.id,
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      event_type: eventType.name,
      status: meeting.status,
    });
  } catch (err) { next(err); }
}

export async function getBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params.meetingId },
      include: { event_type: { include: { user: true } } },
    });
    if (!meeting) return res.status(404).json({ error: 'Booking not found' });
    res.json(meeting);
  } catch (err) { next(err); }
}