import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import validate from '../validators/validate.js';
import { schema } from '../validators/user.validate.js';
import { authenticateToken } from '../middlewares/authenticate.middlewares.js';

const router = Router();

router
    .route('/')
    .get(userController.get)
    .post(validate(schema), userController.create);

router
    .route('/:id')
    .get(authenticateToken, userController.find)
    .put(authenticateToken, validate(schema), userController.update)
    .patch(authenticateToken, userController.activateInactivate)
    .delete(authenticateToken, userController.eliminar);

router.get('/:id/tasks', authenticateToken, userController.getTasks)

router.get('/list/pagination', userController.pagination);

export default router;