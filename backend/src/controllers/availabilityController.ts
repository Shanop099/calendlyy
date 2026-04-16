import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from '../services/availabilityService';
import { getDefaultUser } from '../services/eventTypeService';

const ruleSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  is_available: z.boolean(),
});

const updateSchema = z.object({
  timezone: z.string().optional(),
  rules: z.array(ruleSchema).length(7, 'Must provide rules for all 7 days'),
});

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getDefaultUser();
    const schedule = await service.getAvailability(user.id);
    res.json({ user, schedule });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getDefaultUser();
    const { timezone, rules } = updateSchema.parse(req.body);
    const schedule = await service.upsertAvailability(user.id, timezone, rules);
    res.json(schedule);
  } catch (err) { next(err); }
}