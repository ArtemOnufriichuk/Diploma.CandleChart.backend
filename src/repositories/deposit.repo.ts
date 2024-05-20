import moment from 'moment';
import { EntityManager, FindConditions } from 'typeorm';

import { DepositPreparation } from '../models/DepositPreparation';

class DepositRepository {
  public async getDeposits(
    findOpts: FindConditions<DepositPreparation>
  ): Promise<DepositPreparation[]> {
    return (await DepositPreparation.find({ ...findOpts, relations: ['user'] })).map((deposit) => {
      deposit.validTo = moment(deposit.validTo).format() as any;
      return deposit;
    });
  }

  public async getDeposit(
    findOpts: FindConditions<DepositPreparation>,
    transaction?: EntityManager
  ): Promise<DepositPreparation | undefined> {
    let deposit: DepositPreparation | undefined;
    if (transaction) {
      deposit = await transaction.findOne(DepositPreparation, {
        where: findOpts,
        relations: ['user']
      });
    }
    deposit = await DepositPreparation.findOne({ where: findOpts, relations: ['user'] });
    if (deposit) {
      deposit.validTo = moment(deposit.validTo).format() as any;
    }
    return deposit;
  }

  public async saveDeposit(
    entity: DepositPreparation,
    transaction?: EntityManager
  ): Promise<DepositPreparation> {
    if (transaction) {
      return transaction.save(entity);
    }
    return entity.save();
  }
}

export const depositRepository: DepositRepository = new DepositRepository();
