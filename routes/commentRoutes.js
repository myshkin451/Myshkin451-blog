const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect, admin } = require('../middlewares/authMiddleware');
const commentValidator = require('../validators/commentValidator');
const validate = require('../validators/validate');

// 公开路由 - 获取文章评论
router.get('/post/:postId', commentController.getPostComments);

// 管理员路由
router.get('/recent', protect, admin, commentController.getRecentComments);
router.get('/all', protect, admin, commentController.getAllComments);

router.put('/:commentId', protect, commentValidator.updateComment, validate, commentController.updateComment);
router.delete('/:commentId', protect, commentController.deleteComment);
router.patch('/:commentId/moderate', protect, admin, commentValidator.moderateComment, validate, commentController.moderateComment);

module.exports = router;
