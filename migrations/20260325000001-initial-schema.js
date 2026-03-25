'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── users ──
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      password: { type: Sequelize.STRING(100), allowNull: false },
      avatar: { type: Sequelize.STRING(255), allowNull: true, defaultValue: '/uploads/avatars/default.png' },
      bio: { type: Sequelize.TEXT, allowNull: true },
      isAdmin: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ── categories ──
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      slug: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ── tags ──
    await queryInterface.createTable('tags', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      slug: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ── posts ──
    await queryInterface.createTable('posts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      content: { type: Sequelize.TEXT('long'), allowNull: false },
      excerpt: { type: Sequelize.TEXT, allowNull: true },
      featuredImage: { type: Sequelize.STRING(255), allowNull: true },
      status: { type: Sequelize.ENUM('draft', 'published'), defaultValue: 'draft' },
      viewCount: { type: Sequelize.INTEGER, defaultValue: 0 },
      userId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      categoryId: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'categories', key: 'id' },
        onDelete: 'SET NULL',
      },
      coverImage: { type: Sequelize.STRING(255), allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('posts', ['slug'], { unique: true, name: 'posts_slug_index' });
    await queryInterface.addIndex('posts', ['userId'], { name: 'posts_user_id_index' });

    // ── comments ──
    await queryInterface.createTable('comments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      content: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'approved', allowNull: false },
      userId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      postId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'posts', key: 'id' },
        onDelete: 'CASCADE',
      },
      parentId: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'comments', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // ── post_tags ──
    await queryInterface.createTable('post_tags', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      postId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'posts', key: 'id' },
        onDelete: 'CASCADE',
      },
      tagId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'tags', key: 'id' },
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('post_tags', ['postId', 'tagId'], { unique: true, name: 'post_tags_unique' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('post_tags');
    await queryInterface.dropTable('comments');
    await queryInterface.dropTable('posts');
    await queryInterface.dropTable('tags');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
  },
};
