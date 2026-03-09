import { Sequelize } from 'sequelize';
import env from '../config/env.js';

export const sequelize = new Sequelize(
    env.db_database,
    env.db_user,
    env.db_password,
    {
        host: env.db_host,
        dialect: env.db_dialect,
        logging: console.log,

        dialectOptions: env.db_use_ssl == 'true' ? {
            ssl: {
                require: true,
                rejectUnauthorized: false //Para asegurar que la conexion sea segura en producioon
            }
        }   : {}
    },
);