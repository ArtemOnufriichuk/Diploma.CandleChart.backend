import { EntityManager, FindConditions, getConnection } from 'typeorm';

import { User } from '../models/User';

class UserRepository {
  public async getUsers(findOpts: any): Promise<User[]> {
    return User.find(findOpts);
  }

  public async getUser(
    findOpts: FindConditions<User>,
    transaction?: EntityManager
  ): Promise<User | undefined> {
    if (transaction) {
      return transaction.findOne(User, { where: findOpts });
    }
    return User.findOne({ where: findOpts });
  }

  public async countUsers(findOpts: FindConditions<User>): Promise<number> {
    return User.count({ where: findOpts });
  }

  public updateUserField(entity: User, key: string, value: any): User {
    const userFields: string[] = getConnection()
      .getMetadata(User)
      .ownColumns.map((column) => column.propertyName);
    if (userFields.includes(key) && (entity as any)[key] !== value) {
      (entity as any)[key] = value;
    }
    return entity;
  }

  public async saveUser(entity: User, transaction?: EntityManager): Promise<User> {
    if (transaction) {
      return transaction.save(entity);
    }
    return entity.save();
  }

  public async deleteUser(entity: User, transaction?: EntityManager): Promise<User> {
    if (transaction) {
      return transaction.remove(entity);
    }
    return entity.remove();
  }
}

export const userRepository: UserRepository = new UserRepository();
