import express from 'express';
import { DepositPreparation } from '../models/DepositPreparation';
import { filterBody, handleBulkRequest, isAdmin, isUser } from '../helpers/middleware';
import { depositController } from '../controllers/deposit.controller';

export const router: express.Router = express.Router();

router.get('/', isUser, handleBulkRequest(new DepositPreparation()), depositController.getDeposits);

router.get(
  '/all',
  isAdmin,
  handleBulkRequest(new DepositPreparation()),
  depositController.getDepositsAdmin
);

router.get(
  '/:depositId',
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    if (req.url.startsWith('/all')) {
      return next('router');
    }
    return next();
  },
  isUser,
  depositController.getDeposit
);

router.post('/', isUser, filterBody(['amount']), depositController.createDeposit);

router.put('/:depositId', isAdmin, filterBody(['status']), depositController.updateDeposit);
