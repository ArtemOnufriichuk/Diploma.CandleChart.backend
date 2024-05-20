import moment from 'moment';
import { EntityManager } from 'typeorm';
import { Bet } from '../models/Bet';

class BetRepository {
  public async getBets(findOpts: any): Promise<Bet[]> {
    return (await Bet.find(findOpts)).map((bet) => {
      bet.dateClose = moment(bet.dateClose).format() as any;
      bet.dateOpen = moment(bet.dateOpen).format() as any;
      return bet;
    });
  }

  public async saveBet(entity: Bet, transaction?: EntityManager): Promise<Bet> {
    if (transaction) {
      return transaction.save(entity);
    }
    return entity.save();
  }
}

export const betRepository: BetRepository = new BetRepository();
