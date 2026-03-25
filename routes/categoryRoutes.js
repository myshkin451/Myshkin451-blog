const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/authMiddleware');
const categoryValidator = require('../validators/categoryValidator');
const validate = require('../validators/validate');

// 公开路由
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// 需要管理员权限的路由
router.post('/', protect, admin, categoryValidator.createCategory, validate, categoryController.createCategory);
router.put('/:id', protect, admin, categoryValidator.updateCategory, validate, categoryController.updateCategory);
router.delete('/:id', protect, admin, categoryController.deleteCategory);

module.exports = router;
