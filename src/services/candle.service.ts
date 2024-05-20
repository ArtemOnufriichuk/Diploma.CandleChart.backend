import { v4 as uuid } from 'uuid';
import { CandleEntity } from '../models/Candle';
import { candleRepository } from '../repositories/candle.repo';
import { entityValidator } from '../helpers/utils';
import { ValidationError } from '../helpers/errors';

export enum PairType {
  bitcoin = 'bitcoin',
  binance = 'binance',
  dash = 'dash',
  dogecoin = 'dogecoin',
  ethereum = 'ethereum',
  litecoin = 'litecoin',
  monero = 'monero',
  bitcoinCash = 'bitcoinCash',
  ripple = 'ripple',
  zcash = 'zcash'
}

class CandleService {
  public async getCandles(pair: PairType, limit: number): Promise<CandleEntity[]> {
    if (!Object.keys(PairType).includes(pair)) {
      throw new ValidationError('This type of pair does not exist', '?pair=...');
    }
    return candleRepository.getCandles({ where: { pair }, order: { time: 'DESC' }, take: limit });
  }

  public async createCandle(data: any): Promise<CandleEntity> {
    const candle = new CandleEntity();
    candle.id = uuid();
    candle.close = data.close;
    candle.high = data.high;
    candle.low = data.low;
    candle.open = data.open;
    candle.time = data.time;
    candle.pair = data.pair;
    candle.value = data.value;
    await entityValidator(candle);
    return candleRepository.saveCandle(candle);
  }
}

export const candleService = new CandleService();
