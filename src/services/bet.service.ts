import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { Candle } from '../helpers/constants';
import { ValidationError } from '../helpers/errors';
import { getCryptoPrice } from '../helpers/manipulation_crypto';
import { entityValidator } from '../helpers/utils';
import { Bet } from '../models/Bet';
import { User } from '../models/User';
import { betRepository } from '../repositories/bet.repo';
import { userService } from './user.service';
import { PairType } from './candle.service';

class BetService {
  public async getBets(filter: any): Promise<Bet[]> {
    return betRepository.getBets(filter);
  }
  public async createBets(data: any, user: User): Promise<Bet> {
    if (!Object.keys(PairType).includes(data.pair)) {
      throw new ValidationError('Pair type does not exist', 'pair');
    }
    const bet = new Bet();
    bet.id = uuid();
    bet.user = user;
    bet.pair = data.pair;
    bet.seconds = data.seconds;
    bet.direction = data.direction;
    bet.priceToBet = data.priceToBet;
    bet.profit = data.profit;
    bet.moneyGet = (bet.profit / 100) * data.priceToBet;

    const momentDate = moment();
    bet.dateOpen = momentDate.toDate();
    bet.dateClose = momentDate.add(data.seconds, 'seconds').toDate();

    const candle: Candle = (getCryptoPrice() as any)[bet.pair];
    bet.priceOpen = candle.close;
    await entityValidator(bet);

    if (bet.priceToBet > user.wallet) {
      throw new ValidationError('User does not have so amount of money');
    }

    const createdBet: Bet = await betRepository.saveBet(bet);
    await userService.updateUser(user.id, {
      wallet: user.wallet - data.priceToBet
    });

    setTimeout(async () => {
      const candle: Candle = (getCryptoPrice() as any)[bet.pair];
      const userToBet: User = (await userService.getUser({ id: user.id })) as User;
      if (bet.direction === 'UP') {
        if (bet.priceOpen <= candle.close) {
          userToBet.wallet += data.priceToBet;
          userToBet.wallet += bet.moneyGet;
        }
      }
      if (bet.direction === 'DOWN') {
        if (bet.priceOpen >= candle.close) {
          userToBet.wallet += data.priceToBet;
          userToBet.wallet += bet.moneyGet;
        }
      }
      createdBet.priceClose = candle.close;
      await betRepository.saveBet(createdBet);
      await userService.updateUser(user.id, {
        wallet: userToBet.wallet
      });
    }, bet.seconds * 1000);
    return bet;
  }
}

export const betService = new BetService();
