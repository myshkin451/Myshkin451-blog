const { User, Post, Comment } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { NotFoundError, UnauthorizedError, ConflictError } = require('../utils/AppError');

const USER_ATTRS = ['id', 'username', 'email', 'avatar', 'bio', 'createdAt', 'isAdmin'];

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
};

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );
}

function safeUser(user) {
  return { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin };
}

exports.COOKIE_OPTIONS = COOKIE_OPTIONS;

exports.register = async ({ username, email, password }) => {
  const exists = await User.findOne({
    where: { [Op.or]: [{ username }, { email }] },
  });
  if (exists) throw new ConflictError('用户名或邮箱已被使用');

  const user = await User.create({ username, email, password, isAdmin: false });
  const token = generateToken(user);
  return { token, user: safeUser(user) };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new NotFoundError('用户不存在');

  const valid = await user.validatePassword(password);
  if (!valid) throw new UnauthorizedError('密码错误');

  const token = generateToken(user);
  return { token, user: safeUser(user) };
};

exports.getProfile = async (userId) => {
  const user = await User.findByPk(userId, { attributes: USER_ATTRS });
  if (!user) throw new NotFoundError('用户不存在');
  return user;
};

exports.updateProfile = async (userId, { username, email, bio }) => {
  if (username) {
    const dup = await User.findOne({ where: { username, id: { [Op.ne]: userId } } });
    if (dup) throw new ConflictError('用户名已被使用');
  }
  if (email) {
    const dup = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
    if (dup) throw new ConflictError('邮箱已被使用');
  }

  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('用户不存在');

  await user.update({
    username: username || user.username,
    email: email || user.email,
    bio: bio !== undefined ? bio : user.bio,
  });

  return {
    id: user.id, username: user.username, email: user.email,
    avatar: user.avatar, bio: user.bio, createdAt: user.createdAt, isAdmin: user.isAdmin,
  };
};

exports.updatePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('用户不存在');

  const valid = await user.validatePassword(currentPassword);
  if (!valid) throw new UnauthorizedError('当前密码错误');

  user.password = newPassword;
  await user.save();
};

exports.getUserPosts = async (userId) => {
  return Post.findAll({
    where: { userId },
    attributes: ['id', 'title', 'status', 'createdAt', 'viewCount'],
    order: [['createdAt', 'DESC']],
  });
};

exports.getUserComments = async (userId) => {
  const comments = await Comment.findAll({
    where: { userId },
    include: { model: Post, as: 'post', attributes: ['id', 'title'] },
    order: [['createdAt', 'DESC']],
  });

  return comments.map((c) => ({
    id: c.id, content: c.content, createdAt: c.createdAt,
    postId: c.postId, postTitle: c.post ? c.post.title : '未知文章',
  }));
};
