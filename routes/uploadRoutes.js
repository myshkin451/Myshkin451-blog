const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const { protect } = require('../middlewares/authMiddleware');
const { uploadLimiter } = require('../middlewares/rateLimiter');

// 用户头像上传
router.post('/avatar', protect, uploadLimiter, uploadMiddleware.uploadAvatar, uploadController.uploadUserAvatar);

// 文章图片上传
router.post('/image', protect, uploadLimiter, uploadMiddleware.uploadPostImage, uploadController.uploadPostImage);

// 更新文章封面图
router.post('/posts/:postId/cover', protect, uploadLimiter, uploadMiddleware.uploadPostImage, uploadController.uploadPostImage);

// 删除文章图片
router.delete('/image/:filename', protect, uploadController.deletePostImage);

module.exports = router;