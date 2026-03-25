const { body } = require('express-validator');

exports.register = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 2, max: 30 }).withMessage('用户名长度 2-30 个字符'),
  body('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 100 }).withMessage('密码长度至少 6 位'),
];

exports.login = [
  body('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
  body('password')
    .notEmpty().withMessage('密码不能为空'),
];

exports.updateProfile = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('用户名长度 2-30 个字符'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('邮箱格式不正确'),
  body('bio')
    .optional()
    .isLength({ max: 500 }).withMessage('个人简介不超过 500 字'),
];

exports.updatePassword = [
  body('currentPassword')
    .notEmpty().withMessage('当前密码不能为空'),
  body('newPassword')
    .notEmpty().withMessage('新密码不能为空')
    .isLength({ min: 6, max: 100 }).withMessage('新密码长度至少 6 位'),
];
