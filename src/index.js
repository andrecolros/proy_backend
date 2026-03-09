import app from './app.js';
import env from './config/env.js';
import { sequelize } from './database/database.js';
import logger from './logs/logger.js';

async function main() {
    await sequelize.sync({ force: false });
    const port = env.port;
    app.listen(port);
    logger.info('Server on port ' + port);
}

main();