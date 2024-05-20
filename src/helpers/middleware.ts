import * as express from 'express';
import jwt from 'jsonwebtoken';
import { createLogger, format, transports } from 'winston';
import { NotFoundError, ServerError, ValidationError } from './errors';
import {
  SearchParameterI,
  SearchOperation,
  convertFilter,
  convertFilterWithOr
} from './filtration';
import { SortingOperation } from './sorting';
import { entityValidator, filterObj } from './utils';
import { adminRepository } from '../repositories/admin.repo';
import { Admin } from '../models/Admin';
import { User } from '../models/User';
import { userRepository } from '../repositories/user.repo';

export const handleBulkRequest = (entity: any) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const filterMeta: { [key: string]: SearchParameterI } = Reflect.getMetadata(
    'SEARCH_PARAMETER',
    entity
  );
  if (req.query.filter) {
    const filter: string = req.query.filter as string;
    if (filter.includes('(')) {
      if (filter[0] !== '(' || filter[filter.length - 1] !== ')') {
        throw new ValidationError(
          'Filter with or operator has to start and end with curly braces',
          '?filter=...'
        );
      }
      const filterString = filter
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim());
      if (filterString.length !== 2) {
        throw new ValidationError(
          'You have to provide only 2 filters with or operation',
          '?filter='
        );
      }
      req.query.filter = filterString.map((f) => {
        const keyForStr: string | undefined = Object.keys(filterMeta).find((key) =>
          f.includes(key)
        );
        if (!keyForStr) {
          throw new ValidationError('You can not filter by this field', '?filter=...');
        }
        const operationForKey: SearchOperation | undefined = filterMeta[
          keyForStr
        ].searchOperations.find((operation) => f.includes(operation));
        if (!operationForKey) {
          throw new ValidationError(
            'You can not filter by this operation for this exact field',
            '?filter=...'
          );
        }
        const [filterKey, filterVal] = f.split(operationForKey).map((v) => v.trim());
        let validFilterVal = filterVal;
        const validationAndConvertFun = filterMeta[keyForStr].validationAndConvert;
        if (validationAndConvertFun) {
          validFilterVal = validationAndConvertFun(filterVal);
        }
        return { key: filterKey, value: validFilterVal, operation: operationForKey };
      });
      req.query.filter = convertFilterWithOr(req.query.filter as any);
    } else {
      req.query.filter = filter
        .split(',')
        .map((str) => str.trim())
        .map((str) => {
          const keyForStr: string | undefined = Object.keys(filterMeta).find((key) =>
            str.includes(key)
          );
          if (!keyForStr) {
            throw new ValidationError('You can not filter by this field', '?filter=...');
          }
          const operationForKey: SearchOperation | undefined = filterMeta[
            keyForStr
          ].searchOperations.find((operation) => str.includes(operation));
          if (!operationForKey) {
            throw new ValidationError(
              'You can not filter by this operation for this exact field',
              '?filter=...'
            );
          }
          const [filterKey, filterVal] = str.split(operationForKey).map((v) => v.trim());
          let validFilterVal = filterVal;
          const validationAndConvertFun = filterMeta[keyForStr].validationAndConvert;
          if (validationAndConvertFun) {
            validFilterVal = validationAndConvertFun(filterVal);
          }
          return { key: filterKey, value: validFilterVal, operation: operationForKey };
        });
      req.query.filter = convertFilter(req.query.filter as any);
    }
  } else {
    req.query.filter = {};
  }

  const sortMeta: string[] = Reflect.getMetadata('ORDER_PARAMETER', entity);
  if (req.query.sort) {
    const sort: string = req.query.sort as string;
    if (sort.split(':').length > 2) {
      throw new ValidationError('You can sort only by one field', '?sort=...');
    }
    const [field, operation] = sort.split(':');
    if (!Object.keys(SortingOperation).includes(operation)) {
      throw new ValidationError('This sort operation does not exist', '?sort=...');
    }
    if (!sortMeta.includes(field)) {
      throw new ValidationError('This sort field does not supported', '?sort=...');
    }
    req.query.sort = { [field]: operation };
  } else {
    req.query.sort = {};
  }
  req.query.limit = req.query.limit || '10';
  req.query.limit = Number(req.query.limit) as any;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * Number(req.query.limit);
  req.query.skip = skip as any;
  return next();
};

export const filterBody = (keys: string[]) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const usefulBody: { [key: string]: any } = {};
  Object.keys(req.body).forEach((key) => {
    if (keys.includes(key)) {
      usefulBody[key] = req.body[key];
    }
  });
  req.body = usefulBody;
  return next();
};

export const isAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  if (req.headers.authorization) {
    try {
      const jwtData: any = jwt.verify(req.headers.authorization, process.env.SECRET as string);
      if (!jwtData.username) {
        return next(
          new ValidationError('Admin authorization token is invalid', 'headers.authorization')
        );
      }
      const admin: Admin = await adminRepository.getAdmin();
      if (admin.username !== jwtData.username) {
        return next(
          new ValidationError('Admin authorization token is invalid', 'headers.authorization')
        );
      }
      (req as any).admin = admin;
      return next();
    } catch (e) {
      return next(
        new ValidationError('Admin authorization token is invalid', 'headers.authorization')
      );
    }
  } else {
    return next(new ValidationError('Authorization token is required', 'headers.authorization'));
  }
};

export const isUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  if (req.headers.authorization) {
    try {
      const jwtData: any = jwt.verify(req.headers.authorization, process.env.SECRET as string);
      if (!jwtData.email) {
        return next(new ValidationError('Authorization token is invalid', 'headers.authorization'));
      }
      const user: User | undefined = await userRepository.getUser({ email: jwtData.email });
      if (user) {
        (req as any).user = user;
        return next();
      }
      return next(new ValidationError('Authorization token is invalid', 'headers.authorization'));
    } catch (e) {
      return next(new ValidationError('Authorization token is invalid', 'headers.authorization'));
    }
  } else {
    return next(new ValidationError('Authorization token is required', 'headers.authorization'));
  }
};

export const finalRouter = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const data = (res as any).body;
  if (!data) {
    return next(new NotFoundError('Page Not Found'));
  }
  let status = 200;
  if (req.method === 'POST') {
    status = 201;
  }
  const pagination = (res as any).pagination;
  const objToSend = filterObj({ data, pagination }, true, [undefined]);
  const logObjToSend = { status, ...objToSend };
  if (Number(req.query.limit) > 100) {
    logObjToSend.data = [logObjToSend.data[0], logObjToSend.data.length];
  }
  loggerRes(logObjToSend, req.method);
  res.status(status).send(objToSend);
};

export const errorHandler = (
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  console.error(error);
  let err = error;
  if (!error.status) {
    err = new ServerError(err.message || 'Server Error');
  }
  const objToSend = filterObj(
    { errors: err.errors, error: err.message, path: err.origin, type: err.type },
    true,
    [undefined]
  );
  loggerRes(
    {
      status: err.status,
      ...objToSend
    },
    req.method
  );
  res.status(err.status).send(objToSend);
};

export const validateDto = (dtoEnt: any) => async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    await entityValidator(new dtoEnt(req.body));
    return next();
  } catch (e) {
    return next(e);
  }
};

const myHttpFormat = format.printf(({ timestamp, message }) => {
  const { bodyJson, method, type, path } = JSON.parse(message);
  return `${timestamp} | ${type} ${
    path ? 'path=' + path : ''
  } body="${bodyJson}" method="${method}"`;
});

const loggerHttp = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), myHttpFormat),
  transports: [new transports.Console(), new transports.File({ filename: './log/http.log' })]
});

export const loggerReq = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  loggerHttp.log(
    'info',
    JSON.stringify({
      bodyJson: JSON.stringify(req.body),
      method: req.method,
      type: 'request',
      path: req.originalUrl
    })
  );
  next();
};

export const loggerRes = (resBody: any, method: string): void => {
  loggerHttp.log(
    'info',
    JSON.stringify({ bodyJson: JSON.stringify(resBody), method, type: 'response' })
  );
};
