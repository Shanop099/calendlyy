import { Router } from 'express';
import * as ctrl from '../controllers/meetingController';

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.patch('/:id/cancel', ctrl.cancel);

export default router;