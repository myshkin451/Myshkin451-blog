const { Post, Comment, Category, Tag, User } = require('../models');

exports.getStats = async () => {
  const [postCount, commentCount, categoryCount, tagCount, userCount] = await Promise.all([
    Post.count(),
    Comment.count(),
    Category.count(),
    Tag.count(),
    User.count(),
  ]);

  return { postCount, commentCount, categoryCount, tagCount, userCount };
};
