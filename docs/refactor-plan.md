# 博客系统重构计划

> 基于 2026-03-25 的代码审查生成

## 目标

将现有博客系统从"能用"提升到"可维护、安全、可扩展"的状态。重构遵循渐进式原则，按优先级分阶段执行，每个阶段完成后系统应保持可用。

---

## 第一阶段：安全加固

**优先级：最高 — 必须首先完成**

### 1.1 修复 createdAt 任意篡改漏洞
- **文件:** `controllers/postController.js`
- **问题:** `createPost` 和 `updatePost` 接受用户传入的 `createdAt`，使用 `setDataValue()` 绕过 Sequelize 时间戳保护
- **方案:** 移除用户输入中的 `createdAt`，仅允许 admin 角色通过专用接口修改

### 1.2 移除硬编码 JWT 密钥回退
- **文件:** `middlewares/authMiddleware.js`
- **问题:** `process.env.JWT_SECRET || 'your-secret-key'` 存在回退值，env 未设置时使用弱密钥
- **方案:** 移除回退值，启动时校验 `JWT_SECRET` 必须存在，否则拒绝启动

### 1.3 添加输入验证层
- **新建:** `validators/` 目录
- **依赖:** 引入 `express-validator` 或 `joi`
- **覆盖范围:**
  - 用户注册/登录：email 格式、密码强度、用户名长度
  - 文章 CRUD：title 非空/长度、content 非空、categoryId 有效
  - 评论：content 非空/长度限制
  - 分类/标签：name 非空/长度、slug 格式
- **方案:** 每个 route 文件对应一个 validator 文件，在路由中间件链中执行

### 1.4 后端强制 admin 权限校验
- **文件:** `middlewares/authMiddleware.js`, 各 `routes/*.js`
- **问题:** admin 身份校验依赖前端 localStorage，后端部分接口未校验
- **方案:** 在 `authMiddleware` 中新增 `requireAdmin` 中间件，从数据库/JWT payload 验证角色，所有管理接口必须使用

### 1.5 添加速率限制
- **文件:** `app.js`
- **依赖:** 引入 `express-rate-limit`
- **方案:**
  - 全局：100 req/15min
  - 登录/注册：5 req/15min
  - 文件上传：10 req/hour

### 1.6 Token 存储改为 HttpOnly Cookie
- **文件:** `controllers/userController.js`（设置 cookie）, `middlewares/authMiddleware.js`（读取 cookie）, `client/src/api/index.js`（移除 header 注入）
- **方案:**
  - 登录成功后通过 `Set-Cookie` 下发 token，设置 `httpOnly`, `secure`, `sameSite`
  - 前端 axios 配置 `withCredentials: true`
  - 移除前端 localStorage 中的 token 存取逻辑

### 1.7 添加 CSRF 防护
- **文件:** `app.js`
- **依赖:** 引入 `csurf` 或双重提交 cookie 模式
- **方案:** 配合 1.6 的 cookie 方案，对所有非 GET 请求校验 CSRF token

### 1.8 添加安全 HTTP 头
- **文件:** `app.js`
- **依赖:** 引入 `helmet`
- **方案:** `app.use(helmet())` 一行搞定，包含 XSS 防护、内容类型嗅探防护等

---

## 第二阶段：后端架构重构

**优先级：高 — 安全加固完成后执行**

### 2.1 引入 Service 层
- **新建:** `services/` 目录
- **拆分:**
  - `services/postService.js` — 文章 CRUD 业务逻辑、slug 生成、分页查询
  - `services/userService.js` — 注册/登录/密码加密/token 生成
  - `services/categoryService.js` — 分类 CRUD
  - `services/tagService.js` — 标签 CRUD
  - `services/commentService.js` — 评论 CRUD
  - `services/uploadService.js` — 文件处理逻辑
- **原则:** Controller 只负责解析请求参数 + 调用 Service + 返回响应；Service 负责业务逻辑 + 调用 Model

### 2.2 统一 API 响应格式
- **新建:** `utils/response.js`
- **格式:**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "操作成功",
    "pagination": { "page": 1, "pageSize": 10, "total": 100 }
  }
  ```
  ```json
  {
    "success": false,
    "error": { "code": "VALIDATION_ERROR", "message": "标题不能为空" }
  }
  ```
- **封装:** `success(res, data, message)` / `error(res, statusCode, code, message)` 工具函数

### 2.3 统一错误处理
- **新建:** `utils/AppError.js`
- **方案:**
  - 自定义 `AppError` 类，包含 `statusCode`, `code`, `message`
  - 预定义常见错误：`NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`
  - `app.js` 中注册全局错误中间件，捕获所有 `AppError` 并格式化响应
  - Controller/Service 中直接 `throw new NotFoundError('文章不存在')` 即可

### 2.4 修复 Slug 生成逻辑
- **文件:** `models/Post.js`, `models/Category.js`, `models/Tag.js`
- **问题:** 当前逻辑拼接随机数（如 `my-title-458392`），URL 不美观
- **方案:**
  1. 先尝试纯 title slug：`my-title`
  2. 若数据库中已存在，递增后缀：`my-title-2`, `my-title-3`
  3. 更新文章时，仅在 title 变化时重新生成 slug
  4. 删除 `fixSlugs.js`（不再需要修补脚本）

### 2.5 所有列表接口添加分页
- **文件:** `controllers/postController.js`, `categoryController.js`, `tagController.js`, `commentController.js`
- **方案:**
  - 统一查询参数：`?page=1&pageSize=10&sort=createdAt&order=desc`
  - 返回 `pagination` 对象（见 2.2）
  - `getAllPosts` 当前返回全量数据，必须改为分页
  - `getAllCategories`/`getAllTags` 数据量小可保留全量，但预留分页能力

### 2.6 引入结构化日志
- **依赖:** 引入 `pino`（轻量高性能）或 `winston`
- **方案:**
  - 替换所有 `console.log` / `console.error`
  - 配置日志级别：dev 用 debug，prod 用 info
  - 请求日志中间件（pino-http）
  - 错误日志包含 stack trace + request context

### 2.7 数据库迁移策略
- **工具:** 已安装 `sequelize-cli`
- **方案:**
  1. 初始化 `npx sequelize-cli init`（生成 migrations/seeders 目录）
  2. 根据当前模型创建初始迁移文件
  3. 移除 `models/index.js` 中的 `sequelize.sync({ alter: true })`
  4. 启动时只运行 `sequelize db:migrate`
  5. 后续所有表结构变更通过迁移文件管理

### 2.8 添加数据库索引
- **文件:** 通过迁移文件添加
- **需要的索引:**
  - `posts`: `status`, `categoryId`, `createdAt`（常用查询条件）
  - `posts`: 复合索引 `(status, createdAt)` 用于列表分页
  - `comments`: `postId`, `userId`
  - 确认现有 `slug` unique 索引生效

### 2.9 优化 N+1 查询
- **文件:** `controllers/categoryController.js`, `tagController.js`
- **问题:** `getAllCategories` include 了所有关联文章的完整数据
- **方案:**
  - 列表接口只返回关联数量：`attributes: { include: [[sequelize.fn('COUNT', ...), 'postCount']] }`
  - 详情接口按需加载关联数据，且加分页

---

## 第三阶段：前端架构重构

**优先级：高 — 需配合后端 API 变更同步进行**

### 3.1 引入 Pinia 状态管理
- **依赖:** 引入 `pinia`
- **新建:** `client/src/stores/` 目录
- **Store 划分:**
  - `stores/auth.js` — 用户登录状态、token、用户信息、登录/登出方法
  - `stores/ui.js` — 主题模式、侧边栏状态等 UI 状态
- **原则:** 所有跨组件共享的状态统一进 store

### 3.2 移除直接 localStorage 操作
- **文件:** `client/src/api/index.js`, `client/src/router/index.js`, 各组件
- **方案:** 所有 localStorage 操作内聚到 Pinia store 中，组件通过 store 访问

### 3.3 API 层拆分
- **当前:** `client/src/api/index.js` 一个文件包含所有 API 调用（数百行）
- **拆分为:**
  ```
  client/src/api/
  ├── client.js       # axios 实例配置、拦截器
  ├── auth.js         # 登录、注册、获取用户信息
  ├── posts.js        # 文章 CRUD
  ├── categories.js   # 分类 CRUD
  ├── tags.js         # 标签 CRUD
  ├── comments.js     # 评论 CRUD
  ├── upload.js       # 文件上传
  └── admin.js        # 管理接口
  ```

### 3.4 清理死代码
- **删除:**
  - `client/src/components/HelloWorld.vue` — Vite 脚手架模板文件
  - `client/src/views/PlaceholderView.vue` — 占位组件
  - `client/src/assets/vue.svg` — 默认 logo
  - `testDb.js` — 已注释掉的测试文件
  - `fixSlugs.js` — 修补脚本（slug 逻辑修复后不再需要）
- **确认后删除:**
  - `client/src/style.css` — 如果与 `index.css` 功能重复

### 3.5 合并重复组件
- **文件:** `ArticleCard.vue` + `ArticleCardV2.vue`
- **方案:** 对比两个版本差异，保留更好的版本统一为 `ArticleCard.vue`，更新所有引用

### 3.6 整理 CSS 文件
- **文件:** `client/src/index.css`, `client/src/style.css`
- **方案:** 合并为 `index.css`，按职责组织（Tailwind directives → 全局基础样式 → 组件样式）

### 3.7 移除生产环境 console.log
- **方案一（推荐）:** `vite.config.js` 中配置 esbuild drop:
  ```js
  esbuild: { drop: mode === 'production' ? ['console', 'debugger'] : [] }
  ```
- **方案二:** 全局搜索替换，手动移除调试日志

### 3.8 添加 404 页面 + 错误边界
- **新建:** `client/src/views/NotFoundView.vue`
- **路由:** 添加 `{ path: '/:pathMatch(.*)*', component: NotFoundView }`
- **可选:** 添加全局错误边界组件（Vue 3 的 `onErrorCaptured`）

### 3.9 Admin 页面拆分为子路由
- **当前:** `AdminView.vue` 内用 tab 切换不同管理模块
- **方案:** 改为嵌套路由：
  ```
  /admin              → AdminLayout.vue (侧边栏 + router-view)
  /admin/posts        → PostsManager.vue
  /admin/categories   → CategoriesManager.vue
  /admin/tags         → TagsManager.vue
  /admin/comments     → CommentsManager.vue
  ```
- 好处：URL 可直接分享、浏览器前进后退可用、各模块可独立懒加载

---

## 第四阶段：DevOps 改善

**优先级：中 — 可与前三阶段穿插进行**

### 4.1 精简 Dockerfile
- **当前:** 根目录有 `Dockerfile`（用途不明）、`Dockerfile.backend.dev`、`Dockerfile.backend.prod`，client 下有 `Dockerfile.frontend.dev`、`Dockerfile.prod`
- **目标结构:**
  ```
  Dockerfile              # 后端，multi-stage（dev/prod 共用，通过 target 区分）
  client/Dockerfile       # 前端，multi-stage
  ```
- **后端 Dockerfile 改进:**
  - Multi-stage build 减小镜像体积
  - 添加 `NODE_ENV` ARG 支持
  - 添加健康检查指令
  - 使用非 root 用户运行

### 4.2 完善 CI/CD Pipeline
- **文件:** `.github/workflows/ci-cd.yml`
- **添加步骤:**
  1. Lint 检查（ESLint）
  2. 类型检查（如果迁移到 TypeScript）
  3. 后端单元测试
  4. 前端构建测试
  5. Docker 镜像安全扫描（Trivy）
- **改进部署:**
  - 添加部署前备份
  - 添加回滚机制
  - 移除硬编码路径

### 4.3 完善 .gitignore
- **确保排除:**
  - `.env`（当前似乎已提交到仓库）
  - `.DS_Store`
  - `uploads/`（用户上传内容不应进仓库）
  - `*.log`

### 4.4 配置代码规范工具
- **后端:** ESLint + Prettier
- **前端:** ESLint + Prettier + eslint-plugin-vue
- **Git hooks:** `husky` + `lint-staged`，提交前自动格式化

---

## 第五阶段：测试

**优先级：中 — 重构稳定后补充**

### 5.1 后端 API 测试
- **工具:** `vitest` + `supertest`
- **优先覆盖:**
  - 用户认证流程（注册 → 登录 → token 校验）
  - 文章 CRUD + 权限校验
  - 输入验证（边界值、异常输入）
- **测试数据库:** 使用 SQLite in-memory 或 Docker MySQL 容器

### 5.2 前端组件测试
- **工具:** `vitest` + `@vue/test-utils`
- **优先覆盖:**
  - Pinia stores（auth、ui）
  - 关键组件交互（编辑器保存、评论提交）
  - 路由守卫逻辑

### 5.3 E2E 测试（可选）
- **工具:** Playwright
- **覆盖:** 核心用户流程（注册 → 登录 → 发文 → 评论 → 管理）

---

## 第六阶段：功能增强（可选）

按需选做，不影响核心重构。

| # | 功能 | 说明 |
|---|------|------|
| 6.1 | SEO 优化 | 添加 vue-meta/unhead 管理 meta tags，生成 sitemap.xml |
| 6.2 | 图片优化 | 引入 `sharp`，上传时自动压缩、生成缩略图 |
| 6.3 | Redis 缓存 | 缓存热门文章列表、分类/标签数据，减少数据库压力 |
| 6.4 | 编辑器自动保存 | 定时将草稿存储到 localStorage 或后端，防止意外丢失 |
| 6.5 | 软删除 | 文章/评论添加 `deletedAt` 字段，支持回收站和恢复 |
| 6.6 | API 文档 | 引入 `swagger-jsdoc` + `swagger-ui-express`，自动生成接口文档 |
| 6.7 | 全文搜索 | 引入 Elasticsearch 或 MeiliSearch 替代 SQL LIKE 查询 |
| 6.8 | 文章版本历史 | 每次编辑保存 diff，支持查看和回滚历史版本 |

---

## 执行顺序建议

```
第一阶段（安全加固）
    ↓
第二阶段（后端架构）──→ 第四阶段（DevOps）可穿插
    ↓
第三阶段（前端架构）──→ 第四阶段（DevOps）可穿插
    ↓
第五阶段（测试）
    ↓
第六阶段（功能增强）按需选做
```

前三阶段建议严格按顺序执行，因为：
- 安全问题不修复，其他改动没意义
- 前端依赖后端 API 格式，后端先改前端再适配
- 每个阶段完成后做一次全量功能验证

---

## 重构原则

1. **渐进式** — 每次改动保持系统可用，不做大爆炸式重写
2. **先修后建** — 先修安全漏洞和 bug，再优化架构
3. **向后兼容** — API 变更时考虑前端适配周期，必要时做版本过渡
4. **测试驱动** — 新代码写测试，重构代码补测试
5. **最小改动** — 每个 PR 聚焦一个主题，避免混杂无关变更
