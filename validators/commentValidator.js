const { body } = require('express-validator');

exports.createComment = [
  body('content')
    .trim()
    .notEmpty().withMessage('评论内容不能为空')
    .isLength({ max: 2000 }).withMessage('评论内容不超过 2000 字'),
  body('parentId')
    .optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('父评论 ID 无效'),
];

exports.updateComment = [
  body('content')
    .trim()
    .notEmpty().withMessage('评论内容不能为空')
    .isLength({ max: 2000 }).withMessage('评论内容不超过 2000 字'),
];

exports.moderateComment = [
  body('status')
    .notEmpty().withMessage('状态不能为空')
    .isIn(['pending', 'approved', 'rejected']).withMessage('无效的状态值'),
];
