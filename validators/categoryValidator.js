const { body } = require('express-validator');

exports.createCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('分类名称不能为空')
    .isLength({ max: 50 }).withMessage('分类名称不超过 50 字'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('slug 格式无效，仅允许小写字母、数字和连字符'),
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('描述不超过 200 字'),
];

exports.updateCategory = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('分类名称不能为空')
    .isLength({ max: 50 }).withMessage('分类名称不超过 50 字'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('slug 格式无效，仅允许小写字母、数字和连字符'),
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('描述不超过 200 字'),
];
