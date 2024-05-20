import { EntityManager } from 'typeorm';
import { CandleEntity } from '../models/Candle';

class CandleRepo {
  public async getCandles(findOpts: any): Promise<CandleEntity[]> {
    return CandleEntity.find(findOpts);
  }
  public async saveCandle(
    candle: CandleEntity,
    transaction?: EntityManager
  ): Promise<CandleEntity> {
    if (transaction) {
      return transaction.save(candle);
    }
    return candle.save();
  }
}

export const candleRepository: CandleRepo = new CandleRepo();
