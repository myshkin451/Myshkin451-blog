const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const logger = require('../utils/logger');

// 创建Sequelize实例
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        logging: process.env.NODE_ENV === 'production' ? false : (msg) => logger.debug(msg),
    }
);

// 连接测试在 models/index.js 的 syncDatabase 中统一执行

module.exports = sequelize;