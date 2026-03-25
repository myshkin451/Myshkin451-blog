const logger = require('../utils/logger');
const { sequelize } = require('../models');

sequelize.authenticate()
  .then(() => {
    logger.info('数据库连接成功');
    process.exit(0);
  })
  .catch(err => {
    logger.error({ err }, '数据库连接失败');
    process.exit(1);
  });
