const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const logger = require('../utils/logger');
const { sequelize, User, Category, Tag, syncDatabase } = require('../models');

async function init() {
  try {
    await syncDatabase();
    logger.info('数据库表结构同步完成');

    // 创建默认管理员
    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',   // User模型会自动bcrypt加密
        isAdmin: true,
      },
    });

    logger.info(created ? '管理员账户已创建' : '管理员账户已存在');

    // 创建默认分类（可选）
    const [defaultCategory] = await Category.findOrCreate({
      where: { name: '默认分类' },
      defaults: {
        name: '默认分类',
        description: '默认的文章分类'
      }
    });

    logger.info('默认分类已准备');

  } catch (err) {
    logger.error({ err }, '初始化失败');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

init();
