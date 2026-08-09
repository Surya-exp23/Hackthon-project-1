import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notifications';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
