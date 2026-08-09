import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole(['admin', 'department']));

router.get('/', getAnalytics);

export default router;
