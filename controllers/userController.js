const { catchAsync } = require('../utils/catchAsync');
const { success, created } = require('../utils/response');
const userService = require('../services/userService');

exports.register = catchAsync(async (req, res) => {
  const { token, user } = await userService.register(req.body);
  res.cookie('token', token, userService.COOKIE_OPTIONS);
  created(res, user, '注册成功');
});

exports.login = catchAsync(async (req, res) => {
  const { token, user } = await userService.login(req.body);
  res.cookie('token', token, userService.COOKIE_OPTIONS);
  success(res, user, '登录成功');
});

exports.getUserProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user.id);
  success(res, user);
});

exports.updateUserProfile = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  success(res, user, '个人资料更新成功');
});

exports.updatePassword = catchAsync(async (req, res) => {
  await userService.updatePassword(req.user.id, req.body);
  success(res, null, '密码更新成功');
});

exports.getUserPosts = catchAsync(async (req, res) => {
  const posts = await userService.getUserPosts(req.user.id);
  success(res, posts);
});

exports.getUserComments = catchAsync(async (req, res) => {
  const comments = await userService.getUserComments(req.user.id);
  success(res, comments);
});

exports.getMe = catchAsync(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  success(res, user);
});

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  success(res, null, '登出成功');
};
