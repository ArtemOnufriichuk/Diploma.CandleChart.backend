import * as express from 'express';
import { userController } from '../controllers/user.controller';
import { UpdatePasswordRequestDto } from '../dto/user/updatePassReq.dto';
import { filterBody, handleBulkRequest, isAdmin, isUser, validateDto } from '../helpers/middleware';
import { User } from '../models/User';

export const router: express.Router = express.Router();

router.get('/', isAdmin, handleBulkRequest(new User()), userController.getUsers);

router.get('/me', isUser, userController.getMeUser);

router.get('/admin', isAdmin, userController.getAdmin);

router.get(
  '/:userId',
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (req.url.startsWith('/me') || req.url.startsWith('/admin')) {
      return next('router');
    }
    return next();
  },
  isAdmin,
  userController.getUser
);

router.put(
  '/admin',
  filterBody(['password']),
  validateDto(UpdatePasswordRequestDto),
  isAdmin,
  userController.updateAdminPass
);

router.put(
  '/:userId',
  filterBody(['name', 'password']),
  validateDto(UpdatePasswordRequestDto),
  isUser,
  userController.updateUser
);

router.patch('/wallet/:userId', filterBody(['wallet']), isAdmin, userController.updateUserWallet);

router.patch(
  '/password/:resetToken',
  filterBody(['password']),
  validateDto(UpdatePasswordRequestDto),
  userController.updateUserPass
);

router.patch('/confirm/:confirmToken', userController.confirmUser);

router.patch('/reset', filterBody(['email']), userController.setResetToken);

router.patch('/sendconfirm', filterBody(['email']), userController.setConfirmToken);

router.post(
  '/auth',
  filterBody(['email', 'password', 'isAdmin']),
  validateDto(UpdatePasswordRequestDto),
  userController.authUser
);

router.post(
  '/',
  filterBody(['email', 'password', 'name']),
  validateDto(UpdatePasswordRequestDto),
  userController.createUser
);

router.delete('/:userId', isUser, userController.deleteUser);
