const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// 确保上传目录存在
const createUploadDirs = () => {
	const dirs = ['uploads', 'uploads/avatars', 'uploads/posts'];
	dirs.forEach(dir => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	});
};

createUploadDirs();

// 图片类型的 magic bytes 签名
const MAGIC_BYTES = {
	'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
	'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47])],
	'image/gif': [Buffer.from('GIF87a'), Buffer.from('GIF89a')],
	'image/webp': null, // RIFF....WEBP，需特殊处理
};

/**
 * 通过文件头 magic bytes 校验真实 MIME 类型
 */
function validateMagicBytes(filePath) {
	const buf = Buffer.alloc(12);
	const fd = fs.openSync(filePath, 'r');
	fs.readSync(fd, buf, 0, 12, 0);
	fs.closeSync(fd);

	// JPEG
	if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
	// PNG
	if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
	// GIF
	if (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a') return true;
	// WebP (RIFF....WEBP)
	if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return true;

	return false;
}

// 存储配置
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		let uploadPath = 'uploads/';
		if (req.uploadType === 'avatar') {
			uploadPath += 'avatars/';
		} else if (req.uploadType === 'post') {
			uploadPath += 'posts/';
		}
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		// 使用 crypto UUID 生成安全文件名
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, crypto.randomUUID() + ext);
	}
});

// 文件过滤器（初步检查扩展名和客户端 MIME）
const fileFilter = (req, file, cb) => {
	const allowedTypes = /jpeg|jpg|png|gif|webp/;
	const ext = path.extname(file.originalname).toLowerCase();
	const mimeOk = allowedTypes.test(file.mimetype);

	if (mimeOk && allowedTypes.test(ext.slice(1))) {
		return cb(null, true);
	}
	cb(new Error('只支持图片文件 (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024 // 5MB
	},
	fileFilter: fileFilter
});

/**
 * 上传后验证 magic bytes，防止 MIME 伪造
 */
function postUploadValidation(req, res, next) {
	if (!req.file) return next();

	if (!validateMagicBytes(req.file.path)) {
		// 删除不合法的文件
		fs.unlinkSync(req.file.path);
		return res.status(400).json({ message: '文件类型校验失败：文件内容与扩展名不匹配' });
	}
	next();
}

// 用户头像上传中间件
exports.uploadAvatar = [
	(req, res, next) => { req.uploadType = 'avatar'; next(); },
	(req, res, next) => {
		upload.single('avatar')(req, res, (err) => {
			if (err) return res.status(400).json({ message: err.message });
			next();
		});
	},
	postUploadValidation,
];

// 文章图片上传中间件
exports.uploadPostImage = [
	(req, res, next) => { req.uploadType = 'post'; next(); },
	(req, res, next) => {
		upload.single('image')(req, res, (err) => {
			if (err) return res.status(400).json({ message: err.message });
			next();
		});
	},
	postUploadValidation,
];
