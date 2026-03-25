const { User, Post, Comment } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 天
};


// 注册新用户
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 检查用户名是否已存在
        const usernameExists = await User.findOne({ where: { username } });
        // 检查邮箱是否已存在 
        const emailExists = await User.findOne({ where: { email } });
    
        if (usernameExists || emailExists) {
            return res.status(400).json({ message: '用户名或邮箱已被使用' });
        }
        
        // 创建新用户
        const user = await User.create({
            username,
            email,
            password, // 密码会在model的hook中自动加密
            isAdmin: false // 默认非管理员
        });
        
        // 生成JWT令牌
        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, COOKIE_OPTIONS);
        res.status(201).json({
            message: '注册成功',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 用户登录
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 查找用户
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        
        // 验证密码
        const isPasswordValid = await user.validatePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: '密码错误' });
        }
        
        // 生成JWT令牌
        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, COOKIE_OPTIONS);
        res.json({
            message: '登录成功',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取当前用户个人资料
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'avatar', 'bio', 'createdAt', 'isAdmin']
        });
        
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 更新用户个人资料
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, bio } = req.body;
        
        // 检查用户名是否已被使用
        if (username) {
            const existingUser = await User.findOne({ 
                where: { 
                    username,
                    id: { [Op.ne]: userId } // 排除当前用户
                } 
            });
            
            if (existingUser) {
                return res.status(400).json({ message: '用户名已被使用' });
            }
        }
        
        // 检查邮箱是否已被使用
        if (email) {
            const existingUser = await User.findOne({ 
                where: { 
                    email,
                    id: { [Op.ne]: userId } // 排除当前用户
                } 
            });
            
            if (existingUser) {
                return res.status(400).json({ message: '邮箱已被使用' });
            }
        }
        
        // 查找用户
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        
        // 更新用户资料
        await user.update({
            username: username || user.username,
            email: email || user.email,
            bio: bio !== undefined ? bio : user.bio
        });
        
        // 返回更新后的用户资料
        res.json({
            message: '个人资料更新成功',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                createdAt: user.createdAt,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 更新密码
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        // 验证输入
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: '当前密码和新密码都是必填项' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: '新密码长度不能少于6位' });
        }
        
        // 查找用户
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        
        // 验证当前密码
        const isPasswordValid = await user.validatePassword(currentPassword);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: '当前密码错误' });
        }
        
        // 更新密码
        user.password = newPassword; // 密码会在模型的hook中自动加密
        await user.save();
        
        res.json({ message: '密码更新成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取用户文章
exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const posts = await Post.findAll({
            where: { userId },
            attributes: ['id', 'title', 'status', 'createdAt', 'viewCount'],
            order: [['createdAt', 'DESC']]
        });
        
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 获取用户评论
exports.getUserComments = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const comments = await Comment.findAll({
            where: { userId },
            include: {
                model: Post,
                as: 'post',
                attributes: ['id', 'title']
            },
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            comments: comments.map(comment => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                postId: comment.postId,
                postTitle: comment.post ? comment.post.title : '未知文章'
            }))
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

// 用户登出
exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    res.json({ message: '登出成功' });
};