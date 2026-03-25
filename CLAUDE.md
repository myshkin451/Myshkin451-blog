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
- 后端 package.json 混入前端依赖（ByteMD 等）

### 部署
- 原阿里云 ECS 已过期，当前无运行环境
- CI/CD deploy 阶段会失败（已改为仅手动触发）
- 无数据库迁移策略（开发环境用 `{ alter: true }` 同步）

---

## 重构工作流（跨 Session 协作）

本项目采用分阶段重构，每个阶段在独立 session 中完成，以控制上下文长度。
完整计划见 `docs/refactor-plan.md`。

### 每个 Session 的标准流程

1. **读取计划** — 打开 `docs/refactor-plan.md`，定位"当前进度"区块
2. **审查范围** — 阅读相关源码，理解当前状态
3. **确认方案** — 向用户说明本次要做什么，获得同意后再动手
4. **执行修改** — 按计划实施
5. **本地验证** — 确认改动不破坏现有功能（见下方验证清单）
6. **Git commit** — 验证通过后自动提交，无需用户手动要求
7. **更新计划** — 在 `refactor-plan.md` 中勾选已完成项，更新"当前进度"区块指向下一步

### Commit 规范

每个步骤完成并验证通过后，**自动执行 git commit**，不需要用户额外指示。

- 格式：`refactor(阶段X.Y): 简要描述`
- 示例：`refactor(0.1): 禁用 CI/CD 自动触发，改为手动`
- 如果一个步骤改动量大，可以拆分为多次 commit
- 更新 `refactor-plan.md` 的勾选状态也包含在同一次 commit 中

### 本地验证清单

每个步骤完成后，根据改动范围选择对应验证方式：

| 改动范围 | 验证方式 |
|----------|----------|
| 后端代码 | `npm run dev` 能启动，核心 API 响应正常 |
| 前端代码 | `cd client && npm run dev` 能启动，页面可访问 |
| Docker 配置 | `docker compose -f docker-compose.dev.yml up --build` 全部服务正常 |
| 仅删文件/改配置 | `npm run dev` 或 `npm run build` 无报错即可 |
| 数据库模型 | 启动后 Sequelize 同步无报错，Adminer 中表结构正确 |

如果本地没有 MySQL，优先用 Docker 方式验证。验证结果记录在 `refactor-plan.md` 对应步骤的备注区。

### Session 开始时的 Prompt 模板

```
读 docs/refactor-plan.md，继续重构。
```

### 注意事项
- 每次修改前先读相关文件，不要凭记忆改代码
- 重构过程中如果发现计划需要调整，先更新 refactor-plan.md 再继续
- 如果某步骤完成后发现下一步的前置条件有变，在备注中说明
- 验证失败时先修复再 commit，不要提交有问题的代码
