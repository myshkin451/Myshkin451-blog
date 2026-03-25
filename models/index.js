// 引入数据库连接和模型
const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');
const Category = require('./Category');
const Tag = require('./Tag');
const PostTag = require('./PostTag');
const Comment = require('./Comment');


// 定义模型之间的关联关系

// 用户与文章的关系：一对多
// 一个用户可以有多篇文章
User.hasMany(Post, {
    foreignKey: 'userId',
    as: 'posts',
    onDelete: 'CASCADE' // 当用户被删除时，其所有文章也被删除
});

// 一篇文章属于一个用户
Post.belongsTo(User, {
    foreignKey: 'userId',
    as: 'author'
});

// 分类与文章的关系：一对多
Category.hasMany(Post, {
    foreignKey: 'categoryId',
    as: 'posts'
});

Post.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

Post.belongsToMany(Tag, {
    through: PostTag,
    foreignKey: 'postId',
    otherKey: 'tagId',
    as: 'tags'
});

Tag.belongsToMany(Post, {
    through: PostTag,
    foreignKey: 'tagId',
    otherKey: 'postId',
    as: 'posts'
});

User.hasMany(Comment, {
    foreignKey: 'userId',
    as: 'comments'
});

Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

  // 文章与评论: 一对多
Post.hasMany(Comment, {
    foreignKey: 'postId',
    as: 'comments'
});

Comment.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post'
});

// 评论自关联（嵌套评论）
Comment.hasMany(Comment, {
    foreignKey: 'parentId',
    as: 'replies'
});

Comment.belongsTo(Comment, {
    foreignKey: 'parentId',
    as: 'parent'
});

// 数据库 schema 变更通过 migrations 管理，不再使用 sync({ alter: true })
// 运行 migration: npx sequelize-cli db:migrate
const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
    } catch (error) {
        console.error('数据库连接失败:', error);
    }
};

// 导出模型和同步函数
module.exports = {
    sequelize,
    User,
    Post,
    Category,
    Tag,
    PostTag,
    Comment,
    syncDatabase
};
