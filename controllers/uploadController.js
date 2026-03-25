const { catchAsync } = require('../utils/catchAsync');
const { success } = require('../utils/response');
const uploadService = require('../services/uploadService');

exports.uploadUserAvatar = catchAsync(async (req, res) => {
  const result = await uploadService.uploadUserAvatar(req.file, req.user.id, req);
  success(res, result, '头像上传成功');
});

exports.uploadPostImage = catchAsync(async (req, res) => {
  const result = await uploadService.uploadPostImage(req.file, req.params.postId, req.user, req);
  const message = result.isCover ? '文章封面图更新成功' : '图片上传成功';
  success(res, { url: result.url, path: result.path }, message);
});

exports.deletePostImage = catchAsync(async (req, res) => {
  await uploadService.deletePostImage(req.params.filename, req.user);
  success(res, null, '文件删除成功');
});
