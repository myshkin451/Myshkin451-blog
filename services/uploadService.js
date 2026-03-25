const fs = require('fs');
const path = require('path');
const { User, Post } = require('../models');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/AppError');

function buildUrl(req, relativePath) {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return baseUrl + relativePath;
}

exports.uploadUserAvatar = async (file, userId, req) => {
  if (!file) throw new ValidationError('没有上传文件');

  const avatarPath = `/uploads/avatars/${file.filename}`;
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('用户不存在');

  // 删旧头像
  if (user.avatar && user.avatar !== '/uploads/avatars/default.png') {
    const old = path.join(__dirname, '..', user.avatar);
    if (fs.existsSync(old)) fs.unlinkSync(old);
  }

  user.avatar = avatarPath;
  await user.save();

  return { url: buildUrl(req, avatarPath), path: avatarPath };
};

exports.uploadPostImage = async (file, postId, user, req) => {
  if (!file) throw new ValidationError('没有上传文件');

  const imagePath = `/uploads/posts/${file.filename}`;

  if (postId) {
    const post = await Post.findOne({ where: { id: postId, userId: user.id } });
    if (!post) throw new NotFoundError('文章不存在或无权限');

    if (post.coverImage) {
      const old = path.join(__dirname, '..', post.coverImage);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    post.coverImage = imagePath;
    await post.save();

    return { url: buildUrl(req, imagePath), path: imagePath, isCover: true };
  }

  return { url: buildUrl(req, imagePath), path: imagePath, isCover: false };
};

exports.deletePostImage = async (filename, user) => {
  if (!user.isAdmin) throw new ForbiddenError('仅管理员可删除图片文件');

  if (filename.includes('..') || filename.includes('/')) {
    throw new ValidationError('无效的文件名');
  }

  const filePath = path.join(__dirname, '..', 'uploads', 'posts', filename);
  if (!fs.existsSync(filePath)) throw new NotFoundError('文件不存在');

  fs.unlinkSync(filePath);
};
