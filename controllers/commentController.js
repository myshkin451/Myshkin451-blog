const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { Op } = require('sequelize');
const { stripHtml } = require('../middlewares/sanitize');

// 获取文章的所有评论（嵌套结构）
exports.getPostComments = async (req, res) => {
	try {
		const { postId } = req.params;
		
		// 确认文章存在
		const post = await Post.findByPk(postId);
		if (!post) {
			return res.status(404).json({ message: '文章不存在' });
		}
		
		// 获取顶层评论（没有parentId的评论）
		const topLevelComments = await Comment.findAll({
			where: { 
				postId,
				parentId: null,
				status: 'approved'
			},
			include: [
				{
					model: User,
					as: 'user',
					attributes: ['id', 'username', 'avatar']
				},
				{
					model: Comment,
					as: 'replies',
					include: {
						model: User,
						as: 'user',
						attributes: ['id', 'username', 'avatar']
					}
				}
			],
			order: [['createdAt', 'DESC']]
		});
		
		res.json(topLevelComments);
	} catch (error) {
		console.error('获取评论失败:', error);
		res.status(500).json({ message: '服务器错误' });
	}
};

// 创建评论
exports.createComment = async (req, res) => {
	try {
		const { postId } = req.params;
		const { content, parentId } = req.body;
		const userId = req.user.id;
		
		// 确认文章存在
		const post = await Post.findByPk(postId);
		if (!post) {
			return res.status(404).json({ message: '文章不存在' });
		}
		
		// 如果是回复评论，确认父评论存在
		if (parentId) {
			const parentComment = await Comment.findByPk(parentId);
			if (!parentComment) {
				return res.status(404).json({ message: '父评论不存在' });
			}
			
			// 确认父评论属于同一篇文章
			if (parentComment.postId !== parseInt(postId)) {
				return res.status(400).json({ message: '父评论不属于该文章' });
			}
		}
		
		// 创建评论
		const comment = await Comment.create({
			content: stripHtml(content),
			userId,
			postId,
			parentId: parentId || null
		});
		
		// 返回创建的评论（包含用户信息）
		const newComment = await Comment.findByPk(comment.id, {
			include: {
				model: User,
				as: 'user',
				attributes: ['id', 'username', 'avatar']
			}
		});
		
		res.status(201).json(newComment);
	} catch (error) {
		console.error('创建评论失败:', error);
		res.status(500).json({ message: '服务器错误' });
	}
};

// 更新评论
exports.updateComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const { content } = req.body;
		const userId = req.user.id;
		
		const comment = await Comment.findByPk(commentId);
		if (!comment) {
			return res.status(404).json({ message: '评论不存在' });
		}
		
		// 检查权限（评论作者或管理员可以编辑）
		if (comment.userId !== userId && !req.user.isAdmin) {
			return res.status(403).json({ message: '无权限修改此评论' });
		}
		
		// 更新评论
		comment.content = stripHtml(content);
		await comment.save();
		
		res.json(comment);
	} catch (error) {
		console.error('更新评论失败:', error);
		res.status(500).json({ message: '服务器错误' });
	}
};

// 删除评论
exports.deleteComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const userId = req.user.id;
		
		const comment = await Comment.findByPk(commentId);
		if (!comment) {
			return res.status(404).json({ message: '评论不存在' });
		}
		
		// 检查权限（评论作者或管理员可以删除）
		if (comment.userId !== userId && !req.user.isAdmin) {
			return res.status(403).json({ message: '无权限删除此评论' });
		}
		
		// 删除评论及其所有回复
		await Comment.destroy({
			where: {
				[Op.or]: [
					{ id: commentId },
					{ parentId: commentId }
				]
			}
		});
		
		res.json({ message: '评论已删除' });
	} catch (error) {
		console.error('删除评论失败:', error);
		res.status(500).json({ message: '服务器错误' });
	}
};

// 管理员审核评论
exports.moderateComment = async (req, res) => {
	try {
		const { commentId } = req.params;
		const { status } = req.body;
		
		// 检查状态值是否有效
		if (!['pending', 'approved', 'rejected'].includes(status)) {
			return res.status(400).json({ message: '无效的状态值' });
		}
		
		const comment = await Comment.findByPk(commentId);
		if (!comment) {
			return res.status(404).json({ message: '评论不存在' });
		}
		
		// 更新状态
		comment.status = status;
		await comment.save();
		
		res.json({ message: '评论状态已更新', comment });
	} catch (error) {
		console.error('审核评论失败:', error);
		res.status(500).json({ message: '服务器错误' });
	}
};

// 获取最近评论
exports.getRecentComments = async (req, res) => {
	try {
	  const limit = parseInt(req.query.limit) || 5;
	  
	  const comments = await Comment.findAll({
		include: [
		  {
			model: User,
			as: 'user',
			attributes: ['id', 'username', 'avatar']
		  },
		  {
			model: Post,
			as: 'post',
			attributes: ['id', 'title']
		  }
		],
		order: [['createdAt', 'DESC']],
		limit
	  });
	  
	  res.json({ comments });
	} catch (error) {
	  console.error('获取最近评论失败:', error);
	  res.status(500).json({ message: '服务器错误', error: error.message });
	}
  };
  
// 获取所有评论(管理员用)
exports.getAllComments = async (req, res) => {
	try {
	  const { status } = req.query;
	  
	  const whereCondition = {};
	  if (status) {
		whereCondition.status = status;
	  }
	  
	  const options = {
		include: [
		  {
			model: User,
			as: 'user',
			attributes: ['id', 'username', 'avatar']
		  },
		  {
			model: Post,
			as: 'post',
			attributes: ['id', 'title']
		  },
		  {
			model: Comment,
			as: 'replies',
			include: [
			  {
				model: User,
				as: 'user',
				attributes: ['id', 'username', 'avatar']
			  }
			]
		  }
		],
		order: [['createdAt', 'DESC']]
	  };
	  
	  // 添加顶级评论筛选和状态筛选
	  options.where = { 
		...whereCondition,
		parentId: null // 只获取顶级评论
	  };
	  
	  const comments = await Comment.findAll(options);
	  
	  res.json({ comments });
	} catch (error) {
	  console.error('获取所有评论失败:', error);
	  res.status(500).json({ message: '服务器错误', error: error.message });
	}
  };