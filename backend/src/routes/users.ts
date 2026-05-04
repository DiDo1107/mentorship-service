import { Router } from 'express';
import * as usersController from '../controllers/usersController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.use(authMiddleware);

router.get('/', roleGuard('hr'), usersController.getAllUsers);
router.post('/', roleGuard('hr'), usersController.createUser);
router.get('/:id', usersController.getUser);
router.patch('/:id', roleGuard('hr'), usersController.updateUser);
router.delete('/:id', roleGuard('hr'), usersController.deleteUser);

export default router;
