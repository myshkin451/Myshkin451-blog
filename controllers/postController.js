const { catchAsync } = require('../utils/catchAsync');
const { success, created, paginated } = require('../utils/response');
const postService = require('../services/postService');

exports.getAllPosts = catchAsync(async (req, res) => {
  const posts = await postService.getAllPosts();
  success(res, posts);
});

exports.getPostById = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  success(res, post);
});

exports.createPost = catchAsync(async (req, res) => {
  const post = await postService.createPost(req.body, req.user);
  created(res, post, '文章创建成功');
});

exports.updatePost = catchAsync(async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.body, req.user);
  success(res, post, '文章更新成功');
});

exports.managePostTags = catchAsync(async (req, res) => {
  const tags = await postService.managePostTags(req.params.id, req.body.tagIds, req.user);
  success(res, tags, '文章标签更新成功');
});

exports.deletePost = catchAsync(async (req, res) => {
  await postService.deletePost(req.params.id, req.user);
  success(res, null, '文章删除成功');
});

exports.searchPosts = catchAsync(async (req, res) => {
  const { posts, pagination } = await postService.searchPosts(req.query);
  paginated(res, posts, pagination);
});
