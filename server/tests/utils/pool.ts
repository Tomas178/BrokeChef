import { Pool } from 'pg';
import config from '@server/config';

export const createTestPool = () => {
  return new Pool({
    connectionString: config.database.connectionString,
  });
};
