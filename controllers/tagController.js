const { catchAsync } = require('../utils/catchAsync');
const { success, created } = require('../utils/response');
const tagService = require('../services/tagService');

exports.getAllTags = catchAsync(async (req, res) => {
  const tags = await tagService.getAllTags();
  success(res, tags);
});

exports.getTagById = catchAsync(async (req, res) => {
  const tag = await tagService.getTagById(req.params.id);
  success(res, tag);
});

exports.getTagBySlug = catchAsync(async (req, res) => {
  const tag = await tagService.getTagBySlug(req.params.slug);
  success(res, tag);
});

exports.createTag = catchAsync(async (req, res) => {
  const tag = await tagService.createTag(req.body);
  created(res, tag, '标签创建成功');
});

exports.updateTag = catchAsync(async (req, res) => {
  const tag = await tagService.updateTag(req.params.id, req.body);
  success(res, tag, '标签更新成功');
});

exports.deleteTag = catchAsync(async (req, res) => {
  await tagService.deleteTag(req.params.id);
  success(res, null, '标签删除成功');
});
