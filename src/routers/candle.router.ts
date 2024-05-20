import express from 'express';
import { candleController } from '../controllers/candle.controller';
import { CandleEntity } from '../models/Candle';
import { handleBulkRequest } from '../helpers/middleware';

export const router: express.Router = express.Router();

router.get('/', handleBulkRequest(new CandleEntity()), candleController.getCandles);
