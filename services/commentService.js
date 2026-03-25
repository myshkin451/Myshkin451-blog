const { Comment, Post, User } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/AppError');
const { stripHtml } = require('../middlewares/sanitize');

exports.getPostComments = async (postId) => {
  const post = await Post.findByPk(postId);
  if (!post) throw new NotFoundError('文章不存在');

  return Comment.findAll({
    where: { postId, parentId: null, status: 'approved' },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
      {
        model: Comment, as: 'replies',
        include: { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};

exports.createComment = async (postId, { content, parentId }, userId) => {
  const post = await Post.findByPk(postId);
  if (!post) throw new NotFoundError('文章不存在');

  if (parentId) {
    const parent = await Comment.findByPk(parentId);
    if (!parent) throw new NotFoundError('父评论不存在');
    if (parent.postId !== parseInt(postId)) {
      throw new ValidationError('父评论不属于该文章');
    }
  }

  const comment = await Comment.create({
    content: stripHtml(content),
    userId, postId,
    parentId: parentId || null,
  });

  return Comment.findByPk(comment.id, {
    include: { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
  });
};

exports.updateComment = async (commentId, content, user) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new NotFoundError('评论不存在');
  if (comment.userId !== user.id && !user.isAdmin) {
    throw new ForbiddenError('无权限修改此评论');
  }

  comment.content = stripHtml(content);
  await comment.save();
  return comment;
};

exports.deleteComment = async (commentId, user) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new NotFoundError('评论不存在');
  if (comment.userId !== user.id && !user.isAdmin) {
    throw new ForbiddenError('无权限删除此评论');
  }

  await Comment.destroy({
    where: { [Op.or]: [{ id: commentId }, { parentId: commentId }] },
  });
};

exports.moderateComment = async (commentId, status) => {
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new ValidationError('无效的状态值');
  }

  const comment = await Comment.findByPk(commentId);
  if (!comment) throw new NotFoundError('评论不存在');

  comment.status = status;
  await comment.save();
  return comment;
};

exports.getRecentComments = async (limit = 5) => {
  return Comment.findAll({
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
      { model: Post, as: 'post', attributes: ['id', 'title'] },
    ],
    order: [['createdAt', 'DESC']],
    limit,
  });
};

exports.getAllComments = async ({ status } = {}) => {
  const where = { parentId: null };
  if (status) where.status = status;

  return Comment.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
      { model: Post, as: 'post', attributes: ['id', 'title'] },
      {
        model: Comment, as: 'replies',
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
};
