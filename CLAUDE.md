# Myshkin451 Blog

## 项目概述

个人博客系统，前后端分离架构。支持 Markdown 编辑、分类/标签管理、评论系统、用户认证、图片上传、管理后台。

## 技术栈

### 后端
- **运行时:** Node.js + Express 5.1
- **ORM:** Sequelize 6.37 + MySQL 8.0
- **认证:** JWT (jsonwebtoken) + bcryptjs
- **文件上传:** Multer
- **Markdown:** markdown-it + highlight.js

### 前端
- **框架:** Vue 3.5 (Composition API)
- **构建:** Vite 6.2
- **样式:** Tailwind CSS 3.3 + @tailwindcss/typography
- **路由:** Vue Router 4.5
- **HTTP:** Axios 1.8
- **Markdown 编辑器:** ByteMD

### 部署
- Docker Compose (dev + prod)
- GitHub Actions CI/CD
- Nginx 反向代理（前端生产环境）

## 目录结构

```
Myshkin451-blog/
├── app.js                  # Express 入口
├── config/
│   └── database.js         # Sequelize 数据库配置
├── controllers/            # 路由处理函数
│   ├── adminController.js
│   ├── categoryController.js
│   ├── commentController.js
│   ├── postController.js
│   ├── tagController.js
│   ├── uploadController.js
│   └── userController.js
├── middlewares/
│   ├── authMiddleware.js   # JWT 认证 + 权限校验
│   └── uploadMiddleware.js # Multer 文件上传配置
├── models/                 # Sequelize 数据模型
│   ├── Category.js
│   ├── Comment.js
│   ├── Post.js
│   ├── PostTag.js          # 多对多关联表
│   ├── Tag.js
│   ├── User.js
│   └── index.js            # 模型关联定义 + 数据库同步
├── routes/                 # Express 路由定义
│   ├── index.js            # 路由汇总
│   ├── adminRoutes.js
│   ├── categoryRoutes.js
│   ├── commentRoutes.js
│   ├── postRoutes.js
│   ├── tagRoutes.js
│   ├── uploadRoutes.js
│   └── userRoutes.js
├── scripts/
│   ├── init-db.js          # 数据库初始化脚本
│   └── health-check.js     # 健康检查
├── uploads/                # 用户上传文件（头像、文章图片）
│   ├── avatars/
│   └── posts/
├── client/                 # Vue 前端
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── api/
│   │   │   └── index.js    # Axios 封装 + 所有 API 调用
│   │   ├── router/
│   │   │   └── index.js    # 路由定义 + 导航守卫
│   │   ├── components/     # 通用组件
│   │   │   ├── admin/      # 管理后台组件
│   │   │   └── ...
│   │   ├── views/          # 页面组件
│   │   └── index.css       # 全局样式
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   └── package.json
├── Dockerfile.backend.dev
├── Dockerfile.backend.prod
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
└── package.json
```

## 常用命令

### 本地开发

```bash
# 后端
npm install
npm run dev              # nodemon 启动后端 (端口 3000)
npm run init-db          # 初始化数据库

# 前端
cd client
npm install
npm run dev              # Vite 启动前端 (端口 5173)
npm run build            # 生产构建
```

### Docker 开发环境

```bash
docker compose -f docker-compose.dev.yml up --build    # 启动全部服务
docker compose -f docker-compose.dev.yml down           # 停止
# 包含: MySQL(3306), Backend(3000), Frontend(5173), Adminer(8080)
```

### Docker 生产环境

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 环境变量

参考 `.env.example`，关键变量：
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — 数据库连接
- `JWT_SECRET` — JWT 签名密钥（必须修改默认值）
- `PORT` — 后端端口（默认 3000）
- `BASE_URL` — 后端基础 URL

## 数据模型关系

```
User ─┬─< Post >─── Category
      │    │
      │    └──<> Tag (多对多, 通过 PostTag)
      │
      └─< Comment >── Post
```

## 已知问题

### 安全
- `authMiddleware.js` 中存在硬编码 JWT 密钥回退值
- `postController.js` 中 `createdAt` 可被任意用户篡改
- 前端路由守卫的 admin 校验仅依赖 localStorage，可伪造
- Token 存于 localStorage，存在 XSS 风险
- 无速率限制、无 CSRF 防护

### 架构
- 无 Service 业务逻辑层，所有逻辑堆在 Controller
- 无状态管理（Pinia/Vuex），前端依赖 localStorage
- API 响应格式不统一
- 无输入验证层
- 数据库使用 `{ alter: true }` 同步，无迁移机制

### 代码质量
- 零测试覆盖
- Slug 生成拼接随机数导致 URL 不美观
- 列表接口缺少分页（getAllPosts, getAllCategories 等）
- 存在死代码：testDb.js, HelloWorld.vue, fixSlugs.js
- ArticleCard.vue 和 ArticleCardV2.vue 重复组件
- 大量 console.log 残留
