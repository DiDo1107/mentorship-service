import { Router } from 'express';
import * as feedbackController from '../controllers/feedbackController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/pair/:pairId', feedbackController.getFeedbackByPair);
router.post('/', roleGuard('mentor', 'employee'), feedbackController.createFeedback);
router.patch('/:id', roleGuard('mentor', 'employee'), feedbackController.updateFeedback);

export default router;
