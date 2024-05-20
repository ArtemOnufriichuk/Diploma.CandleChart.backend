import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.prod.env' });
} else {
  dotenv.config();
}

import { databaseInstance } from '../helpers/db';
import { Admin } from '../models/Admin';

databaseInstance
  .dbConnect()
  .then(() => {
    console.log('Successfully connected');
    return Admin.find();
  })
  .then((findAdmin: Admin[]) => {
    if (findAdmin.length === 0) {
      return bcrypt.hash(process.env.ADMIN_PASSWORD as string, 7);
    }
    return;
  })
  .then((hashPass: string | undefined) => {
    if (hashPass) {
      console.log('Admin successfully created');
      const admin: Admin = new Admin();
      admin.id = uuid();
      admin.username = process.env.ADMIN_USERNAME as string;
      admin.password = hashPass;
      return admin.save();
    }
    console.log('Admin already exist');
    return;
  })
  .then(() => {
    return databaseInstance.dbClient?.close();
  })
  .catch((e) => {
    console.error(e);
  });
