const crypto = require('crypto');

const CSRF_COOKIE = 'csrf-token';
const CSRF_HEADER = 'x-csrf-token';

/**
 * CSRF 防护中间件（Double-Submit Cookie 模式）
 *
 * GET/HEAD/OPTIONS 请求：如果没有 CSRF cookie 则生成一个
 * 其他请求（POST/PUT/DELETE/PATCH）：校验 header 中的 token 与 cookie 匹配
 */
const csrfProtection = (req, res, next) => {
  // 读取类方法：确保 cookie 存在
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.cookies[CSRF_COOKIE]) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // 前端需要读取
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }
    return next();
  }

  // 写入类方法：校验 token
  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: 'CSRF token 校验失败' });
  }

  next();
};

module.exports = csrfProtection;
