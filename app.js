const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { sequelize, syncDatabase } = require('./models');
const routes = require('./routes');
const { globalLimiter } = require('./middlewares/rateLimiter');
const csrfProtection = require('./middlewares/csrf');
const { AppError } = require('./utils/AppError');

// 加载环境变量
dotenv.config();

// 启动前校验必需的环境变量
if (!process.env.JWT_SECRET) {
  console.error('致命错误：环境变量 JWT_SECRET 未设置。请在 .env 文件中配置后重启。');
  process.exit(1);
}

const app = express();

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/api', csrfProtection);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// 路由
app.use('/api', routes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '路由不存在', code: 'NOT_FOUND' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  // 已发送响应则交给 Express 默认处理
  if (res.headersSent) {
    return next(err);
  }

  // 可预期的业务错误（AppError 及其子类）
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? err.errors.map(e => e.message).join('; ') : err.message;
    return res.status(400).json({
      success: false,
      message: messages,
      code: 'VALIDATION_ERROR',
    });
  }

  // express-validator / JSON 解析错误
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: '请求体 JSON 格式无效',
      code: 'VALIDATION_ERROR',
    });
  }

  // 未知错误 — 生产环境隐藏细节
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  // 同步数据库
  await syncDatabase();
  console.log(`服务器在 http://localhost:${PORT} 运行中`);
});

module.exports = app;