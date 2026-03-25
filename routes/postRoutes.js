const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');
const postValidator = require('../validators/postValidator');
const commentValidator = require('../validators/commentValidator');
const validate = require('../validators/validate');

// 公开路由
router.get('/', postController.getAllPosts);
router.get('/search', postController.searchPosts);
router.get('/:id', postController.getPostById);

// 需要登录的路由
router.post('/', protect, postValidator.createPost, validate, postController.createPost);
router.put('/:id', protect, postValidator.updatePost, validate, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.put('/:id/tags', protect, postController.managePostTags);
router.get('/:postId/comments', commentController.getPostComments);
router.post('/:postId/comments', protect, commentValidator.createComment, validate, commentController.createComment);

module.exports = router;
