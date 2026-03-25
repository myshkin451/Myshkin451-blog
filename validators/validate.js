const { validationResult } = require('express-validator');

/**
 * 通用验证结果处理中间件
 * 放在 express-validator 检查规则之后使用
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: '输入验证失败',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
