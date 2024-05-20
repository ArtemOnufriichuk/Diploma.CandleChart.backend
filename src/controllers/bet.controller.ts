import express from 'express';
import { betService } from '../services/bet.service';

class BetController {
  public async getBets(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      req.query.filter = { ...(req.query.filter as any), user: { id: (req as any).user.id } };
      (res as any).body = await betService.getBets({
        where: req.query.filter,
        order: req.query.sort,
        take: req.query.limit,
        skip: req.query.skip
      });
      return next();
    } catch (e) {
      return next(e);
    }
  }

  public async getBetsAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await betService.getBets({
        where: req.query.filter,
        order: req.query.sort,
        take: req.query.limit,
        skip: req.query.skip
      });
      return next();
    } catch (e) {
      return next(e);
    }
  }

  public async createBet(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await betService.createBets(req.body, (req as any).user);
      return next();
    } catch (e) {
      return next(e);
    }
  }
}

export const betController = new BetController();
