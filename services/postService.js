const { Post, User, Category, Tag } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ForbiddenError } = require('../utils/AppError');
const { stripHtml, sanitizeContent } = require('../middlewares/sanitize');

const POST_INCLUDES = [
  { model: User, as: 'author', attributes: ['id', 'username'] },
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
  { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
];

exports.getAllPosts = async () => {
  return Post.findAll({
    include: POST_INCLUDES,
    order: [['createdAt', 'DESC']],
  });
};

exports.getPostById = async (id) => {
  const post = await Post.findByPk(id, {
    include: { model: User, as: 'author', attributes: ['id', 'username'] },
  });
  if (!post) throw new NotFoundError('文章不存在');

  post.viewCount += 1;
  await post.save();
  return post;
};

exports.createPost = async (body, user) => {
  const postData = {
    title: stripHtml(body.title),
    content: sanitizeContent(body.content),
    excerpt: stripHtml(body.excerpt),
    status: body.status || 'draft',
    userId: user.id,
    categoryId: body.categoryId || null,
    coverImage: body.coverImage || null,
  };

  if (body.createdAt && user.isAdmin) {
    postData.createdAt = body.createdAt;
  }

  const post = await Post.create(postData);

  if (body.tagIds && body.tagIds.length > 0) {
    await post.addTags(body.tagIds);
  }

  return Post.findByPk(post.id, { include: POST_INCLUDES });
};

exports.updatePost = async (id, body, user) => {
  const post = await Post.findByPk(id);
  if (!post) throw new NotFoundError('文章不存在');
  if (post.userId !== user.id && !user.isAdmin) {
    throw new ForbiddenError('没有权限修改此文章');
  }

  post.title = stripHtml(body.title);
  post.content = sanitizeContent(body.content);
  post.excerpt = stripHtml(body.excerpt);
  post.status = body.status;
  post.categoryId = body.categoryId || post.categoryId;
  post.coverImage = body.coverImage;

  if (body.createdAt && user.isAdmin) {
    post.setDataValue('createdAt', body.createdAt);
  }

  await post.save();

  if (body.tagIds) {
    await post.setTags([]);
    if (body.tagIds.length > 0) {
      await post.addTags(body.tagIds);
    }
  }

  return Post.findByPk(post.id, { include: POST_INCLUDES });
};

exports.managePostTags = async (id, tagIds, user) => {
  const post = await Post.findByPk(id);
  if (!post) throw new NotFoundError('文章不存在');
  if (post.userId !== user.id && !user.isAdmin) {
    throw new ForbiddenError('没有权限修改此文章的标签');
  }

  if (tagIds && Array.isArray(tagIds)) {
    await post.setTags(tagIds);
  }

  const updatedPost = await Post.findByPk(post.id, {
    include: { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
  });
  return updatedPost.tags;
};

exports.deletePost = async (id, user) => {
  const post = await Post.findByPk(id);
  if (!post) throw new NotFoundError('文章不存在');
  if (post.userId !== user.id && !user.isAdmin) {
    throw new ForbiddenError('没有权限删除此文章');
  }
  await post.destroy();
};

exports.searchPosts = async ({ query, page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC', status }) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (status) where.status = status;
  if (query) {
    where[Op.or] = [
      { title: { [Op.like]: `%${query}%` } },
      { content: { [Op.like]: `%${query}%` } },
      { excerpt: { [Op.like]: `%${query}%` } },
    ];
  }

  const count = await Post.count({ where });
  const posts = await Post.findAll({
    where,
    include: POST_INCLUDES,
    order: [[sortBy, order]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  const currentPage = parseInt(page);
  const totalPages = Math.ceil(count / limit);

  return {
    posts,
    pagination: { total: count, totalPages, currentPage, pageSize: parseInt(limit) },
  };
};
