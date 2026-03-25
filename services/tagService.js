const { Tag, Post, User, Category } = require('../models');
const { NotFoundError } = require('../utils/AppError');

exports.getAllTags = async () => {
  const tags = await Tag.findAll({
    include: [{
      model: Post, as: 'posts', attributes: ['id'],
      where: { status: 'published' }, required: false,
    }],
    order: [['name', 'ASC']],
  });

  return tags.map((t) => ({
    id: t.id, name: t.name, slug: t.slug,
    postCount: t.posts ? t.posts.length : 0,
    createdAt: t.createdAt, updatedAt: t.updatedAt,
  }));
};

exports.getTagById = async (id) => {
  const tag = await Tag.findByPk(id, {
    include: {
      model: Post, as: 'posts',
      include: { model: User, as: 'author', attributes: ['id', 'username'] },
      attributes: ['id', 'title', 'slug', 'excerpt', 'createdAt'],
    },
  });
  if (!tag) throw new NotFoundError('标签不存在');
  return tag;
};

exports.getTagBySlug = async (slug) => {
  const tag = await Tag.findOne({
    where: { slug },
    include: {
      model: Post, as: 'posts',
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
      ],
      where: { status: 'published' },
      attributes: ['id', 'title', 'slug', 'content', 'excerpt', 'createdAt', 'viewCount', 'coverImage'],
      order: [['createdAt', 'DESC']],
    },
  });
  if (!tag) throw new NotFoundError('标签不存在');
  return tag;
};

exports.createTag = async ({ name }) => {
  return Tag.create({ name });
};

exports.updateTag = async (id, { name }) => {
  const tag = await Tag.findByPk(id);
  if (!tag) throw new NotFoundError('标签不存在');
  await tag.update({ name });
  return tag;
};

exports.deleteTag = async (id) => {
  const tag = await Tag.findByPk(id);
  if (!tag) throw new NotFoundError('标签不存在');
  await tag.destroy();
};
