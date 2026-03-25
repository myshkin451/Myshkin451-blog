const rateLimit = require('express-rate-limit');

// 全局限制：100 次 / 15 分钟
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 登录/注册限制：5 次 / 15 分钟
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: '登录/注册尝试过于频繁，请 15 分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 文件上传限制：10 次 / 小时
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: '上传过于频繁，请 1 小时后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter, uploadLimiter };
