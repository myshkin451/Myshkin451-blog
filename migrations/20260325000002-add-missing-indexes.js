'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // posts: status, categoryId, createdAt, 复合索引 (status, createdAt)
    await queryInterface.addIndex('posts', ['status'], { name: 'posts_status_index' });
    await queryInterface.addIndex('posts', ['categoryId'], { name: 'posts_category_id_index' });
    await queryInterface.addIndex('posts', ['createdAt'], { name: 'posts_created_at_index' });
    await queryInterface.addIndex('posts', ['status', 'createdAt'], { name: 'posts_status_created_at_index' });

    // comments: postId, userId
    await queryInterface.addIndex('comments', ['postId'], { name: 'comments_post_id_index' });
    await queryInterface.addIndex('comments', ['userId'], { name: 'comments_user_id_index' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('comments', 'comments_user_id_index');
    await queryInterface.removeIndex('comments', 'comments_post_id_index');
    await queryInterface.removeIndex('posts', 'posts_status_created_at_index');
    await queryInterface.removeIndex('posts', 'posts_created_at_index');
    await queryInterface.removeIndex('posts', 'posts_category_id_index');
    await queryInterface.removeIndex('posts', 'posts_status_index');
  },
};
