import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from '../services/eventTypeService';

const eventTypeSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  duration: z.number().int().positive(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  is_active: z.boolean().optional(),
  location: z.string().max(255).optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await service.getDefaultUser();
    const eventTypes = await service.listEventTypes(user.id);
    res.json(eventTypes);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const et = await service.getEventTypeById(req.params.id);
    if (!et) return res.status(404).json({ error: 'Event type not found' });
    res.json(et);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await service.getDefaultUser();
    const data = eventTypeSchema.parse(req.body);
    const et = await service.createEventType(user.id, data);
    res.status(201).json(et);
  } catch (err) {
    if (err instanceof Error && (err as any).code === 'SLUG_TAKEN') {
      return res.status(409).json({ error: 'Slug already taken. Choose a different one.' });
    }
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = eventTypeSchema.partial().parse(req.body);
    const et = await service.updateEventType(req.params.id, data);
    res.json(et);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteEventType(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && (err as any).code === 'EVENT_TYPE_IN_USE') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
}
