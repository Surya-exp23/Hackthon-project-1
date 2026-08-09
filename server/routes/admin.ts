import { Router } from 'express';
import { updateReportStatus, assignReportDepartment } from '../controllers/admin';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const statusSchema = z.object({
  body: z.object({
    status: z.enum(['open', 'assigned', 'in_progress', 'resolved']),
    note: z.string().optional(),
  }),
});

const assignSchema = z.object({
  body: z.object({
    department: z.string(),
  }),
});

// All admin routes require authentication and admin/department role
router.use(authenticate);
router.use(requireRole(['admin', 'department']));

router.patch('/reports/:id/status', validate(statusSchema), updateReportStatus);
router.patch('/reports/:id/assign', requireRole(['admin']), validate(assignSchema), assignReportDepartment);

export default router;
