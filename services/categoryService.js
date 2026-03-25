const { Category, Post, User, Tag } = require('../models');
const { sequelize } = require('../models');
const { NotFoundError } = require('../utils/AppError');

exports.getAllCategories = async () => {
  const categories = await Category.findAll({
    attributes: {
      include: [
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM posts WHERE posts.categoryId = Category.id AND posts.status = \'published\')'
          ),
          'postCount',
        ],
      ],
    },
    order: [['name', 'ASC']],
  });

  return categories.map((c) => ({
    id: c.id, name: c.name, slug: c.slug, description: c.description,
    postCount: parseInt(c.getDataValue('postCount'), 10),
    createdAt: c.createdAt, updatedAt: c.updatedAt,
  }));
};

exports.getCategoryById = async (id) => {
  const category = await Category.findByPk(id, {
    include: { model: Post, as: 'posts', attributes: ['id', 'title', 'slug', 'excerpt', 'createdAt'] },
  });
  if (!category) throw new NotFoundError('分类不存在');
  return category;
};

exports.getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({
    where: { slug },
    include: {
      model: Post, as: 'posts',
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatar'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
      ],
      where: { status: 'published' },
      attributes: ['id', 'title', 'slug', 'content', 'excerpt', 'createdAt', 'viewCount', 'coverImage'],
      order: [['createdAt', 'DESC']],
    },
  });
  if (!category) throw new NotFoundError('分类不存在');
  return category;
};

exports.createCategory = async ({ name, description }) => {
  return Category.create({ name, description });
};

exports.updateCategory = async (id, { name, description }) => {
  const category = await Category.findByPk(id);
  if (!category) throw new NotFoundError('分类不存在');
  await category.update({ name, description });
  return category;
};

exports.deleteCategory = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) throw new NotFoundError('分类不存在');
  await category.destroy();
};
