const { catchAsync } = require('../utils/catchAsync');
const { success, created } = require('../utils/response');
const commentService = require('../services/commentService');

exports.getPostComments = catchAsync(async (req, res) => {
  const comments = await commentService.getPostComments(req.params.postId);
  success(res, comments);
});

exports.createComment = catchAsync(async (req, res) => {
  const comment = await commentService.createComment(req.params.postId, req.body, req.user.id);
  created(res, comment);
});

exports.updateComment = catchAsync(async (req, res) => {
  const comment = await commentService.updateComment(req.params.commentId, req.body.content, req.user);
  success(res, comment);
});

exports.deleteComment = catchAsync(async (req, res) => {
  await commentService.deleteComment(req.params.commentId, req.user);
  success(res, null, '评论已删除');
});

exports.moderateComment = catchAsync(async (req, res) => {
  const comment = await commentService.moderateComment(req.params.commentId, req.body.status);
  success(res, comment, '评论状态已更新');
});

exports.getRecentComments = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const comments = await commentService.getRecentComments(limit);
  success(res, comments);
});

exports.getAllComments = catchAsync(async (req, res) => {
  const comments = await commentService.getAllComments(req.query);
  success(res, comments);
});
