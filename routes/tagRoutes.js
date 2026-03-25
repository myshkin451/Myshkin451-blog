const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { protect, admin } = require('../middlewares/authMiddleware');
const tagValidator = require('../validators/tagValidator');
const validate = require('../validators/validate');

// 公开路由
router.get('/slug/:slug', tagController.getTagBySlug);
router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);

// 需要管理员权限的路由
router.post('/', protect, admin, tagValidator.createTag, validate, tagController.createTag);
router.put('/:id', protect, admin, tagValidator.updateTag, validate, tagController.updateTag);
router.delete('/:id', protect, admin, tagController.deleteTag);

module.exports = router;
