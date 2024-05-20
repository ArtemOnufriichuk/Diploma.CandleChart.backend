import { Connection, createConnection } from 'typeorm';
import { Admin } from '../models/Admin';
import { Bet } from '../models/Bet';
import { CandleEntity } from '../models/Candle';
import { DepositPreparation } from '../models/DepositPreparation';
import { User } from '../models/User';

class DatabaseInstance {
  public dbClient: Connection | null = null;

  public async dbConnect(withDb = true): Promise<void> {
    const connOpt: any = {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      synchronize: true,
      logging: false,
      entities: [Admin, Bet, CandleEntity, DepositPreparation, User],
      cli: {
        entitiesDir: 'src/models',
        migrationsDir: 'src/migration',
        subscribersDir: 'src/subscriber'
      }
    };
    if (withDb) {
      connOpt.database = process.env.DB_NAME;
    }
    this.dbClient = await createConnection(connOpt);
  }
}

export const databaseInstance = new DatabaseInstance();
