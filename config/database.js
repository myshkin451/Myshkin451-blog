const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 创建Sequelize实例
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: process.env.DB_PORT || 3306,
        logging: console.log
    }
);

// 测试连接
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('成功连接到数据库！');
    } catch (error) {
        console.error('无法连接到数据库:', error.message);
    }
}

testConnection();

module.exports = sequelize;