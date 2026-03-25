const { Tag, Post, User, Category } = require('../models');

// 获取所有标签
exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.findAll({
            include: [
                {
                    model: Post,
                    as: 'posts',
                    attributes: ['id'],
                    where: { status: 'published' },
                    required: false // 确保没有文章的标签也能返回
                }
            ],
            order: [['name', 'ASC']]
        });

        // 映射结果，包含文章数量
        const result = tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            postCount: tag.posts ? tag.posts.length : 0,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取单个标签及其文章
exports.getTagById = async (req, res) => {
    try {
        const tag = await Tag.findByPk(req.params.id, {
            include: {
                model: Post,
                as: 'posts',
                include: {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username']
                },
                attributes: ['id', 'title', 'slug', 'excerpt', 'createdAt']
            }
        });
        
        if (!tag) {
            return res.status(404).json({ message: '标签不存在' });
        }
        
        res.json(tag);
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 创建标签
exports.createTag = async (req, res) => {
    try {
        const { name } = req.body;
        
        const tag = await Tag.create({
            name
        });
        
        res.status(201).json({
            message: '标签创建成功',
            tag
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 更新标签
exports.updateTag = async (req, res) => {
    try {
        const { name } = req.body;
        const tag = await Tag.findByPk(req.params.id);
        
        if (!tag) {
            return res.status(404).json({ message: '标签不存在' });
        }
        
        await tag.update({
            name
        });
        
        res.json({
            message: '标签更新成功',
            tag
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 删除标签
exports.deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findByPk(req.params.id);
        
        if (!tag) {
            return res.status(404).json({ message: '标签不存在' });
        }
        
        await tag.destroy();
        
        res.json({ message: '标签删除成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 通过slug获取标签及其文章
    exports.getTagBySlug = async (req, res) => {
        try {
        const slug = req.params.slug;
        const tag = await Tag.findOne({
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
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug']
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
        
        if (!tag) {
            return res.status(404).json({ message: '标签不存在' });
        }
        
        res.json(tag);
        } catch (error) {
        console.error('获取标签详情失败:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
        }
    };
