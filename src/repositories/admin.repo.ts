import { EntityManager } from 'typeorm';

import { Admin } from '../models/Admin';

class AdminRepository {
  public async getAdmin(transaction?: EntityManager): Promise<Admin> {
    let admin: Admin;
    if (transaction) {
      [admin] = await transaction.find(Admin);
    } else {
      [admin] = await Admin.find();
    }
    return admin;
  }

  public async saveAdmin(entity: Admin, transaction?: EntityManager): Promise<Admin> {
    if (transaction) {
      return transaction.save(entity);
    }
    return entity.save();
  }
}

export const adminRepository: AdminRepository = new AdminRepository();
