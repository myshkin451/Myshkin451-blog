const fs   = require('fs');
const path = require('path');
const User = require('../models/User');
const Post = require('../models/Post');

/**
 * 上传用户头像
 */
exports.uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '没有上传文件' });

    const userId  = req.user.id;
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const avatarUrl  = baseUrl + avatarPath;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: '用户不存在' });

    // 删旧头像
    if (user.avatar && user.avatar !== '/uploads/avatars/default.png') {
      const old = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    user.avatar = avatarPath;      // 只存相对路径
    await user.save();

    res.json({ message: '头像上传成功', url: avatarUrl, path: avatarPath });
  } catch (err) {
    console.error('上传头像失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 上传文章图片（普通插图或封面）
 * POST /api/upload/post           -> 普通图片
 * POST /api/upload/post/:postId   -> 指定文章封面
 */
exports.uploadPostImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '没有上传文件' });

    const baseUrl   = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imagePath = `/uploads/posts/${req.file.filename}`;
    const imageUrl  = baseUrl + imagePath;

    // ——1. 如果带 postId，更新封面—————————————
    if (req.params.postId) {
      const post = await Post.findOne({
        where: { id: req.params.postId, userId: req.user.id }
      });
      if (!post) return res.status(404).json({ message: '文章不存在或无权限' });

      // 删旧封面
      if (post.coverImage) {
        const old = path.join(__dirname, '..', post.coverImage);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }

      post.coverImage = imagePath;   // 只存相对路径
      await post.save();

      return res.json({
        message: '文章封面图更新成功',
        url: imageUrl,
        path: imagePath
      });
    }

    // ——2. 普通插图—————————————
    res.json({
      message: '图片上传成功',
      url: imageUrl,
      path: imagePath
    });
  } catch (err) {
    console.error('上传图片失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 删除文章图片文件（仅管理员可操作）
 */
exports.deletePostImage = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: '仅管理员可删除图片文件' });
    }

    const { filename } = req.params;
    if (filename.includes('..') || filename.includes('/'))
      return res.status(400).json({ message: '无效的文件名' });

    const filePath = path.join(__dirname, '..', 'uploads', 'posts', filename);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: '文件不存在' });

    fs.unlinkSync(filePath);
    res.json({ message: '文件删除成功' });
  } catch (err) {
    console.error('删除文件失败:', err);
    res.status(500).json({ message: '服务器错误' });
  }
};
