import { Router } from 'express';
import * as tasksController from '../controllers/tasksController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/pair/:pairId', tasksController.getTasksByPair);
router.post('/', roleGuard('mentor'), tasksController.createTask);
router.patch('/:id', tasksController.updateTask);
router.delete('/:id', roleGuard('mentor'), tasksController.deleteTask);

export default router;
