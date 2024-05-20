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
    return databaseInstance.dbClient?.query('DROP SCHEMA public CASCADE');
  })
  .then(() => {
    return databaseInstance.dbClient?.query('CREATE SCHEMA public');
  })
  .then(() => {
    console.log('Database was successfully clear');
    databaseInstance.dbClient?.close();
  })
  .catch((e) => {
    console.error(e);
  });
