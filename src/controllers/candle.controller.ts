import express from 'express';
import { candleService } from '../services/candle.service';

class CandleController {
  public async getCandles(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await candleService.getCandles(
        req.query.pair as any,
        req.query.limit as any
      );
      return next();
    } catch (e) {
      return next(e);
    }
  }
}

export const candleController = new CandleController();
