import express from 'express';
import { MoreThanOrEqual } from 'typeorm';
import { depositService } from '../services/deposit.service';

class DepositController {
  public async getDepositsAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      if (req.query.getOption && req.query.getOption === 'modern') {
        req.query.filter = {
          ...(req.query.filter as any),
          validTo: MoreThanOrEqual(new Date())
        } as any;
      }
      if (req.query.user) {
        req.query.filter = {
          ...(req.query.filter as any),
          user: { id: req.query.user }
        } as any;
      }
      (res as any).body = await depositService.getDeposits({
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

  public async getDeposits(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      req.query.filter = { ...(req.query.filter as any), user: { id: (req as any).user.id } };
      if (req.query.getOption && req.query.getOption === 'modern') {
        req.query.filter = {
          ...(req.query.filter as any),
          validTo: MoreThanOrEqual(new Date())
        } as any;
      }
      (res as any).body = await depositService.getDeposits({
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

  public async getDeposit(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await depositService.getDeposit(req.params.depositId, (req as any).user);
      return next();
    } catch (e) {
      return next(e);
    }
  }

  public async createDeposit(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await depositService.createDeposit(req.body, (req as any).user);
      return next();
    } catch (e) {
      return next(e);
    }
  }

  public async updateDeposit(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await depositService.updateDeposit(req.params.depositId, req.body);
      return next();
    } catch (e) {
      return next(e);
    }
  }
}

export const depositController = new DepositController();
