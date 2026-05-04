import { Router } from 'express';
import * as pairsController from '../controllers/pairsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/', pairsController.getPairs);
router.get('/:id', pairsController.getPairById);
router.post('/', roleGuard('hr'), pairsController.createPair);
router.patch('/:id/status', roleGuard('hr'), pairsController.updatePairStatus);

export default router;
