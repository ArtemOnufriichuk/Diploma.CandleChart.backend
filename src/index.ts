import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import moment from 'moment-timezone';

moment.tz.setDefault('Europe/Moscow');
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.prod.env' });
} else {
  dotenv.config();
}

import { databaseInstance } from './helpers/db';
import { runServerAndWS } from './helpers/server';
import { errorHandler, finalRouter, loggerReq } from './helpers/middleware';
import { router as userRouter } from './routers/user.router';
import { router as candleRouter } from './routers/candle.router';
import { router as depositRouter } from './routers/deposit.router';
import { router as betRouter } from './routers/bet.router';

const app: express.Application = express();
let btcWallet: string;

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(loggerReq);

// TODO: fix chart stopping
app.get(
  '/btcwallet',
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    (res as any).body = { btcWallet };
    return next();
  }
);
app.put(
  '/btcwallet',
  (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    btcWallet = req.body.btcWallet;
    (res as any).body = { btcWallet };
    return next();
  }
);
app.use('/users', userRouter);
app.use('/candles', candleRouter);
app.use('/deposit', depositRouter);
app.use('/bet', betRouter);

app.use(finalRouter);
app.use(errorHandler);

databaseInstance
  .dbConnect()
  .then(() => {
    runServerAndWS(app);
  })
  .catch((error) => {
    console.error(error);
  });
