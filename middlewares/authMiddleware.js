const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 验证JWT令牌
exports.protect = async (req, res, next) => {
    try {
        let token;
    
        // 检查Authorization头
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
    
        if (!token) {
            return res.status(401).json({ message: '请先登录' });
        }
    
        // 验证令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        // 查找用户
        const user = await User.findByPk(decoded.id);
    
        if (!user) {
            return res.status(401).json({ message: '用户不存在' });
        }
    
        // 将用户信息附加到请求对象
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: '认证失败', error: error.message });
    }
};

// 验证管理员权限
exports.admin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: '需要管理员权限' });
    }
    next();
};
