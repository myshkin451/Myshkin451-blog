const { Category, Post, User, Tag } = require('../models');

// 获取所有分类
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [
                {
                    model: Post,
                    as: 'posts',
                    attributes: ['id'],
                    where: { status: 'published' },
                    required: false // 确保没有文章的分类也能返回
                }
            ],
            order: [['name', 'ASC']]
        });

        // 映射结果，包含文章数量
        const result = categories.map(category => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            postCount: category.posts ? category.posts.length : 0,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取单个分类及其文章
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: {
                model: Post,
                as: 'posts',
                attributes: ['id', 'title', 'slug', 'excerpt', 'createdAt']
            }
        });

        if (!category) {
            return res.status(404).json({ message: '分类不存在' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 创建分类
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const category = await Category.create({
            name,
            description
        });

        res.status(201).json({
            message: '分类创建成功',
            category
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 更新分类
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ message: '分类不存在' });
        }

        await category.update({
            name,
            description
        });

        res.json({
            message: '分类更新成功',
            category
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 删除分类
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({ message: '分类不存在' });
        }

        // 也可以考虑将该分类下的文章移动到"未分类"
        await category.destroy();

        res.json({ message: '分类删除成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

    // 通过slug获取分类及其文章
exports.getCategoryBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const category = await Category.findOne({
        where: { slug },
        include: {
            model: Post,
            as: 'posts',
            include: [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'avatar']
            },
            {
                model: Tag,
                as: 'tags',
                attributes: ['id', 'name', 'slug'],
                through: { attributes: [] }
            }
            ],
            where: { status: 'published' },
            attributes: ['id', 'title', 'slug', 'content', 'excerpt', 'createdAt', 'viewCount', 'coverImage'],
            order: [['createdAt', 'DESC']]
        }
        });
        
        if (!category) {
        return res.status(404).json({ message: '分类不存在' });
        }
        
        res.json(category);
    } catch (error) {
        console.error('获取分类详情失败:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
    };