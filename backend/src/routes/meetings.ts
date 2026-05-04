import { Router } from 'express';
import * as meetingsController from '../controllers/meetingsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/pair/:pairId', meetingsController.getMeetingsByPair);
router.post('/', roleGuard('mentor'), meetingsController.createMeeting);
router.patch('/:id', roleGuard('mentor'), meetingsController.updateMeeting);
router.delete('/:id', roleGuard('mentor'), meetingsController.deleteMeeting);

export default router;
