import moment from 'moment';
import { v4 as uuid } from 'uuid';
import { NotFoundError } from '../helpers/errors';
import { entityValidator } from '../helpers/utils';
import { DepositPreparation } from '../models/DepositPreparation';
import { User } from '../models/User';
import { depositRepository } from '../repositories/deposit.repo';

class DepositService {
  public async getDeposits(filter: any): Promise<DepositPreparation[]> {
    return depositRepository.getDeposits(filter);
  }
  public async getDeposit(id: string, user: User): Promise<DepositPreparation> {
    const deposit: DepositPreparation | undefined = await depositRepository.getDeposit({
      id,
      user: { id: user.id }
    });
    if (!deposit) {
      throw new NotFoundError('Deposit does not exist');
    }
    return deposit;
  }
  public async createDeposit(data: any, user: User): Promise<DepositPreparation> {
    const deposit = new DepositPreparation();
    deposit.id = uuid();
    deposit.amount = data.amount;
    deposit.user = user;
    deposit.validTo = moment(new Date()).add(7, 'days').toDate();
    await entityValidator(deposit);
    await depositRepository.saveDeposit(deposit);
    return deposit;
  }
  public async updateDeposit(id: string, data: any): Promise<DepositPreparation> {
    const deposit: DepositPreparation | undefined = await depositRepository.getDeposit({
      id
    });
    if (!deposit) {
      throw new NotFoundError('Deposit does not exist');
    }
    if (data.status && data.status !== deposit.status) {
      deposit.status = data.status;
    }
    await depositRepository.saveDeposit(deposit);
    return deposit;
  }
}

export const depositService = new DepositService();
