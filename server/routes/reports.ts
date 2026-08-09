import { Router } from 'express';
import { createReport, getReports, getReportById, analyzeReport, checkDuplicates } from '../controllers/reports';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const reportSchema = z.object({
  body: z.object({
    imageUrl: z.string().url(),
    description: z.string().optional(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()).length(2),
    }),
    address: z.string().optional(),
    category: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    duplicateOf: z.string().optional(),
  }).passthrough(),
});

router.post('/', authenticate, validate(reportSchema), createReport);
router.get('/', getReports); // public or auth depending on need; let's allow public for map
router.get('/:id', getReportById);

router.post('/analyze', authenticate, analyzeReport);
router.post('/duplicate-check', authenticate, checkDuplicates);

export default router;
