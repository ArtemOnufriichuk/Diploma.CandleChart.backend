import express from 'express';
import { betController } from '../controllers/bet.controller';
import { filterBody, handleBulkRequest, isAdmin, isUser } from '../helpers/middleware';
import { Bet } from '../models/Bet';

export const router: express.Router = express.Router();

router.get('/', isUser, handleBulkRequest(new Bet()), betController.getBets);

router.get('/all', isAdmin, handleBulkRequest(new Bet()), betController.getBetsAdmin);

router.post(
  '/',
  isUser,
  filterBody(['direction', 'seconds', 'pair', 'profit', 'priceToBet']),
  betController.createBet
);
