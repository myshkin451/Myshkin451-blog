const { catchAsync } = require('../utils/catchAsync');
const { success, created } = require('../utils/response');
const categoryService = require('../services/categoryService');

exports.getAllCategories = catchAsync(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  success(res, categories);
});

exports.getCategoryById = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  success(res, category);
});

exports.getCategoryBySlug = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  success(res, category);
});

exports.createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  created(res, category, '分类创建成功');
});

exports.updateCategory = catchAsync(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  success(res, category, '分类更新成功');
});

exports.deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  success(res, null, '分类删除成功');
});
