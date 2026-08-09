import { Router } from 'express';
import { getMapIssues } from '../controllers/map';

const router = Router();

// Map route is public to allow citizens to explore the city map
router.get('/issues', getMapIssues);

export default router;
