const { body } = require('express-validator');

exports.createPost = [
  body('title')
    .trim()
    .notEmpty().withMessage('标题不能为空')
    .isLength({ max: 200 }).withMessage('标题不超过 200 字'),
  body('content')
    .notEmpty().withMessage('内容不能为空'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 }).withMessage('摘要不超过 500 字'),
  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('状态只能是 draft 或 published'),
  body('categoryId')
    .optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('分类 ID 无效'),
  body('tagIds')
    .optional()
    .isArray().withMessage('标签 ID 必须是数组'),
  body('tagIds.*')
    .optional()
    .isInt({ min: 1 }).withMessage('标签 ID 无效'),
];

exports.updatePost = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('标题不能为空')
    .isLength({ max: 200 }).withMessage('标题不超过 200 字'),
  body('content')
    .optional()
    .notEmpty().withMessage('内容不能为空'),
  body('excerpt')
    .optional()
    .isLength({ max: 500 }).withMessage('摘要不超过 500 字'),
  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('状态只能是 draft 或 published'),
  body('categoryId')
    .optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('分类 ID 无效'),
  body('tagIds')
    .optional()
    .isArray().withMessage('标签 ID 必须是数组'),
  body('tagIds.*')
    .optional()
    .isInt({ min: 1 }).withMessage('标签 ID 无效'),
];
