import { FindConditions } from 'typeorm';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { io } from '../helpers/server';
import { Admin } from '../models/Admin';
import { User } from '../models/User';
import { adminRepository } from '../repositories/admin.repo';
import { userRepository } from '../repositories/user.repo';
import { emailService } from '../helpers/emailIntegration';
import { NotFoundError, ValidationError } from '../helpers/errors';
import { entityValidator } from '../helpers/utils';

class UserService {
  public async authUser(email: string, password: string, isAdmin = false): Promise<string> {
    if (isAdmin) {
      const admin: Admin = await adminRepository.getAdmin();
      if (admin.username !== email) {
        throw new ValidationError('Admin username is wrong', 'username');
      }
      if (await bcrypt.compare(password, admin.password)) {
        return jwt.sign({ username: admin.username }, process.env.SECRET as string, {
          expiresIn: '10h'
        });
      }
      throw new ValidationError('Admin password is wrong', 'password');
    } else {
      const user: User | undefined = await userRepository.getUser({ email });
      if (!user) {
        throw new NotFoundError('This user does not exist');
      }
      if (!user.confirm) {
        throw new ValidationError('You have to confirm your account first');
      }
      if (await bcrypt.compare(password, user.password)) {
        return jwt.sign({ email: user.email }, process.env.SECRET as string, { expiresIn: '10h' });
      }
      throw new ValidationError('User password is wrong', 'password');
    }
  }
  public async getUsers(filter: any): Promise<User[]> {
    return userRepository.getUsers(filter);
  }
  public async count(filter: FindConditions<User>): Promise<number> {
    return userRepository.countUsers(filter);
  }
  public async getUser(filter: FindConditions<User>): Promise<User | undefined> {
    return userRepository.getUser(filter);
  }
  public async getAdmin(): Promise<Admin> {
    return adminRepository.getAdmin();
  }
  public async updateUser(id: string, fields: any): Promise<User | undefined> {
    let sendWalletEmit = false;
    const user: User | undefined = await this.getUser({ id });
    if (!user) {
      return;
    }
    if (fields.wallet) {
      fields.wallet = Number((Math.round(fields.wallet * 100) / 100).toFixed(2));
      sendWalletEmit = true;
    }
    Object.keys(fields).map((key) => userRepository.updateUserField(user, key, fields[key]));
    if (fields.password) {
      user.password = await bcrypt.hash(fields.password, 7);
    }
    await entityValidator(user);
    await userRepository.saveUser(user);
    if (sendWalletEmit) {
      io.emit('userWallet', user.wallet);
    }
    return user;
  }
  public async setToken(
    email: string,
    confirm: boolean,
    reset: boolean
  ): Promise<User | undefined> {
    const user: User | undefined = await this.getUser({ email });
    if (!user) {
      return;
    }
    if (confirm) {
      let confirmToken: string | undefined = user.confirmEmailToken;
      if (!confirmToken) {
        confirmToken = uuid();
        user.confirmEmailToken = confirmToken;
        await userRepository.saveUser(user);
      }
      await emailService.sendConfirmToken(confirmToken, email);
    } else if (reset) {
      let resetToken: string | undefined = user.resetPasswordToken;
      if (!resetToken) {
        resetToken = uuid();
        user.resetPasswordToken = resetToken;
        await userRepository.saveUser(user);
      }
      await emailService.sendResetToken(resetToken, email);
    }
    return user;
  }
  public async updateAdmin(password: string): Promise<Admin> {
    const admin: Admin = await adminRepository.getAdmin();
    admin.password = await bcrypt.hash(password, 7);
    await entityValidator(admin);
    await adminRepository.saveAdmin(admin);
    return admin;
  }
  public async createUser(data: any): Promise<User> {
    if (await this.getUser({ email: data.email })) {
      throw new ValidationError('User with this email already exist', 'email');
    }
    const user: User = new User();
    user.id = uuid();
    data.password = await bcrypt.hash(data.password, 7);
    user.name = data.name;
    user.email = data.email;
    user.password = data.password;
    await entityValidator(user);
    await userRepository.saveUser(user);
    const userWithToken: User | undefined = await this.setToken(user.email, true, false);
    return userWithToken as User;
  }
  public async deleteUser(id: string): Promise<User | undefined> {
    const user: User | undefined = await this.getUser({ id });
    if (!user) {
      return;
    }
    return await userRepository.deleteUser(user);
  }
}

export const userService: UserService = new UserService();
