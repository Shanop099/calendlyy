import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from '../services/meetingService';
import { getDefaultUser } from '../services/eventTypeService';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getDefaultUser();
    const filter = req.query.filter as string | undefined;
    const meetings = await service.listMeetings(user.id, filter);
    res.json(meetings);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const meeting = await service.getMeetingById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) { next(err); }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = z.object({ reason: z.string().optional() }).parse(req.body);
    const meeting = await service.cancelMeeting(req.params.id, reason);
    res.json(meeting);
  } catch (err) { next(err); }
}