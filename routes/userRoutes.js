const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const userValidator = require('../validators/userValidator');
const validate = require('../validators/validate');

// 公开路由
router.post('/register', authLimiter, userValidator.register, validate, userController.register);
router.post('/login', authLimiter, userValidator.login, validate, userController.login);
// 个人中心相关路由
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userValidator.updateProfile, validate, userController.updateUserProfile);
router.put('/password', protect, userValidator.updatePassword, validate, userController.updatePassword);
router.get('/posts', protect, userController.getUserPosts);
router.get('/comments', protect, userController.getUserComments);

module.exports = router;
