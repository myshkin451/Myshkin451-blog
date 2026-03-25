const { body } = require('express-validator');

exports.createTag = [
  body('name')
    .trim()
    .notEmpty().withMessage('标签名称不能为空')
    .isLength({ max: 30 }).withMessage('标签名称不超过 30 字'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('slug 格式无效，仅允许小写字母、数字和连字符'),
];

exports.updateTag = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('标签名称不能为空')
    .isLength({ max: 30 }).withMessage('标签名称不超过 30 字'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('slug 格式无效，仅允许小写字母、数字和连字符'),
];
