import createApp from './app';
import config from './config';
import { createDatabase } from './database';

const database = createDatabase(config.database);
const app = createApp(database);

app.listen(config.port, () => {
  console.log(`Server is running at http://localhost:${config.port}`);
});
