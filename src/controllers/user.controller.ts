import express from 'express';
import { NotFoundError, ValidationError } from '../helpers/errors';
import { User } from '../models/User';

import { userService } from '../services/user.service';

class UserController {
  public async createUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await userService.createUser(req.body);
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async deleteUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      if ((req as any).user.id !== req.params.userId) {
        return next(new ValidationError('You can delete only yourself'));
      }
      (res as any).body = await userService.deleteUser(req.params.userId);
      if (!(res as any).body) {
        throw new NotFoundError('This user does not exist');
      }
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async authUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = {
        token: await userService.authUser(req.body.email, req.body.password, req.body.isAdmin)
      };
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async getAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = (req as any).admin;
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async getUsers(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await userService.getUsers({
        where: req.query.filter,
        order: req.query.sort,
        take: req.query.limit,
        skip: req.query.skip
      });
      const total: number = await userService.count(req.query.filter as any);
      (res as any).pagination = {
        total,
        inPage: (res as any).body.length,
        limit: req.query.limit,
        skip: req.query.skip
      };
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async getMeUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = (req as any).user;
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async getUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      const user: User | undefined = await userService.getUser({ id: req.params.userId });
      if (!user) {
        throw new NotFoundError('User with this id does not exist');
      }
      (res as any).body = user;
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async updateAdminPass(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await userService.updateAdmin(req.body.password);
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async updateUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      if ((req as any).user.id !== req.params.userId) {
        throw new ValidationError('You can update only yourself', '/:userId');
      }
      (res as any).body = await userService.updateUser(req.params.userId, req.body);
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async updateUserWallet(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await userService.updateUser(req.params.userId, req.body);
      if (!(res as any).body) {
        throw new NotFoundError('This user does not exist');
      }
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async updateUserPass(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      const user: User | undefined = await userService.getUser({
        resetPasswordToken: req.params.resetToken
      });
      if (!user) {
        throw new NotFoundError('User with this reset token does not exist');
      }
      (res as any).body = await userService.updateUser(user.id, {
        ...req.body,
        resetPasswordToken: null
      });
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async confirmUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      const user: User | undefined = await userService.getUser({
        confirmEmailToken: req.params.confirmToken
      });
      if (!user) {
        throw new NotFoundError('User with this confirm token does not exist');
      }
      (res as any).body = await userService.updateUser(user.id, {
        confirm: true,
        confirmEmailToken: null
      });
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async setResetToken(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await userService.setToken(req.body.email, false, true);
      if (!(res as any).body) {
        throw new NotFoundError('User with this email does not exist');
      }
      return next();
    } catch (e) {
      return next(e);
    }
  }
  public async setConfirmToken(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> {
    try {
      (res as any).body = await userService.setToken(req.body.email, true, false);
      if (!(res as any).body) {
        throw new NotFoundError('User with this email does not exist');
      }
      return next();
    } catch (e) {
      return next(e);
    }
  }
}

export const userController: UserController = new UserController();
