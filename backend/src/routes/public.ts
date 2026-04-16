import { Router } from 'express';
import * as ctrl from '../controllers/publicController';

const router = Router();

router.get('/booking/:meetingId', ctrl.getBooking);
router.get('/:username/:slug', ctrl.getEventType);
router.get('/:username/:slug/slots', ctrl.getSlots);
router.post('/:username/:slug/book', ctrl.book);

export default router;