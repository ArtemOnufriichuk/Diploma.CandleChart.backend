import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.prod.env' });
} else {
  dotenv.config();
}

import { databaseInstance } from '../helpers/db';

databaseInstance
  .dbConnect(false)
  .then(() => {
    console.log('Successfully connected');
    return databaseInstance.dbClient?.query(
      `SELECT * FROM pg_database WHERE datname = '${process.env.DB_NAME}'`
    );
  })
  .then((res) => {
    if (res.length === 0) {
      console.log('Database created');
      return databaseInstance.dbClient?.query(`CREATE DATABASE  ${process.env.DB_NAME}`);
    }
    console.log('Database already exist');
    return;
  })
  .then(() => {
    databaseInstance.dbClient?.close();
  })
  .catch((e) => {
    console.error(e);
  });
