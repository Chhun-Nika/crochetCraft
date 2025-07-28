import { Sequelize } from 'sequelize';
import dbConfig from './config/db.config.js';

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.PORT,
    logging: false,
  }
);

export default sequelize; 