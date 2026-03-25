# 博客系统重构计划

> 基于 2026-03-25 代码审查生成
>
> **跨 Session 工作流：** 每个阶段在独立 session 中执行。新 session 开始时读取本文件，定位当前进度，执行对应步骤，完成后更新勾选状态和备注。
>
> **每步完成后：** 本地验证 → 自动 git commit → 勾选完成 → 更新"当前进度"
>
> 状态图例: `[ ]` 未开始 · `[~]` 进行中 · `[x]` 已完成 · `[!]` 方案有变，见备注

## 目标

将博客系统从"能用"提升到"可维护、安全、可扩展"。渐进式执行，每阶段完成后系统保持可用。

## 当前进度

> **下一步：** 阶段 1，步骤 1C.3
>
> 阶段 0 已于 2026-03-25 全部完成。

---

## 阶段 0：准备工作（无功能变更）

> 目标：清理噪音、锁定基线，让后续每个阶段的 diff 干净可读。

- [x] **0.1 禁用 CI/CD 自动触发**
  - `.github/workflows/ci-cd.yml`：去掉 `push` 触发，仅保留 `workflow_dispatch`
  - 原因：ECS 已过期，每次 push 白跑 build + deploy 必定失败

- [x] **0.2 清理死代码和冗余文件**
  - 删除 `testDb.js`、`fixSlugs.js`
  - 删除 `client/src/components/HelloWorld.vue`
  - 确认 `ArticleCard.vue` vs `ArticleCardV2.vue` 哪个在用，删除多余的
  - 确认 `PlaceholderView.vue` 用途，决定保留或删除
  - 清理所有 `console.log`（保留 `console.error` 用于真正的错误）
  - 删除 `.DS_Store`，加入 `.gitignore`

- [x] **0.3 修复后端 package.json**
  - 移除不属于后端的依赖：`@bytemd/*`、`bytemd`、`highlight.js`、`markdown-it`
  - 这些是前端库，后端不应引用

- [x] **0.4 统一代码风格基础设施**
  - 添加 `.editorconfig`
  - 可选：ESLint + Prettier（可在阶段 1 一起加）

**阶段 0 验证：** `npm run dev` 和 `cd client && npm run build` 无报错即可（仅删文件/改配置，不涉及功能）

**阶段 0 备注：**
- 0.2: `ArticleCard.vue` 和 `ArticleCardV2.vue` 均在使用中（分别用于列表页和首页），保留两者，合并工作留到阶段 3B.1
- 0.2: `PlaceholderView.vue` 是 `/guestbook` 路由的临时占位组件，属未完成功能，保留
- 0.2: `.DS_Store` 已从 git 追踪中移除（`.gitignore` 原已包含该规则，但文件之前已被提交）
- 0.2: 保留了启动/运维脚本中的 `console.log`（app.js, scripts/, config/database.js, models/index.js）
- 0.4: ESLint + Prettier 留到阶段 1 一起加
- 验证：`cd client && npm run build` 构建成功

---

## 阶段 1：安全加固

> 目标：修复所有 Critical/High 安全问题。优先级最高，必须首先完成。

### 1A. 认证 & 授权

- [x] **1A.1 修复 JWT 密钥问题**
  - 文件：`middlewares/authMiddleware.js`
  - 问题：`process.env.JWT_SECRET || 'your-secret-key'` 存在弱密钥回退
  - 方案：移除回退值，启动时若 `JWT_SECRET` 未设置直接报错退出
  - 更新 `.env.example` 注明必须修改

- [x] **1A.2 修复 createdAt 篡改漏洞**
  - 文件：`controllers/postController.js`
  - 问题：`createPost`/`updatePost` 接受用户传入的 `createdAt`，用 `setDataValue()` 绕过 Sequelize 时间戳保护
  - 方案：仅 admin 可设置 `createdAt`，普通用户提交的直接忽略

- [x] **1A.3 强化授权中间件**
  - 文件：`middlewares/authMiddleware.js`、各 `routes/*.js`
  - 在 `authMiddleware` 中新增 `requireAdmin` 中间件，从 JWT payload 验证角色
  - 所有管理接口必须使用
  - 资源所有权检查（编辑/删除 post/comment 时校验 userId）

### 1B. 输入验证 & 防护

- [x] **1B.1 添加输入验证层**
  - 新建 `validators/` 目录，引入 `express-validator` 或 `joi`
  - 覆盖范围：
    - 用户注册/登录：email 格式、密码强度、用户名长度
    - 文章 CRUD：title 非空/长度、content 非空、categoryId 有效
    - 评论：content 非空/长度限制
    - 分类/标签：name 非空/长度、slug 格式
  - 每个 route 文件对应一个 validator 文件

- [x] **1B.2 添加速率限制**
  - 引入 `express-rate-limit`
  - 全局：100 req/15min
  - 登录/注册：5 req/15min
  - 文件上传：10 req/hour

- [x] **1B.3 添加安全 HTTP 头**
  - 引入 `helmet`
  - `app.js` 中 `app.use(helmet())`

- [x] **1B.4 XSS 防护**
  - 对用户输入的 HTML/Markdown 做 sanitize
  - 纯文本字段（标题、用户名）strip HTML

### 1C. Token & 上传安全

- [x] **1C.1 改善 Token 安全**
  - 采用方案 A：HttpOnly Cookie
  - 设置 `httpOnly`/`secure`(生产环境)/`sameSite: lax`/`maxAge: 1d`

- [x] **1C.2 强化文件上传校验**
  - 校验文件 MIME type（不能只看扩展名）
  - 限制上传频率
  - 生成安全文件名，防止路径穿越

- [ ] **1C.3 添加 CSRF 防护**
  - 若采用 Cookie 方案，需配合 CSRF token
  - 对所有非 GET 请求校验

**阶段 1 验证：** `npm run dev` 启动无报错 + 用 curl 测试：登录接口（速率限制生效）、创建文章（验证规则生效、createdAt 不可篡改）、无 token 访问受保护接口返回 401

**阶段 1 备注：**

---

## 阶段 2：后端架构重构

> 目标：建立 service 层、统一错误处理与响应格式、修复数据模型问题。

### 2A. 错误处理 & 响应格式

- [ ] **2A.1 创建统一错误类**
  - 新建 `utils/AppError.js` — 自定义错误类，含 `statusCode`、`code`、`message`
  - 新建 `utils/catchAsync.js` — controller 异步包装器，消除重复 try/catch
  - 预定义：`NotFoundError`、`ValidationError`、`UnauthorizedError`、`ForbiddenError`

- [ ] **2A.2 创建统一响应工具**
  - 新建 `utils/response.js`
  - 统一格式：`{ success, data, message, pagination? }`
  - 封装 `success(res, data, message)` / `error(res, err)`

- [ ] **2A.3 重写全局错误中间件**
  - `app.js` 中 error handler 改用 AppError 分类处理
  - 开发环境返回 stack trace，生产环境只返回安全信息

### 2B. Service 层

- [ ] **2B.1 建立 services/ 目录**
  - `services/postService.js` — 文章 CRUD、slug 生成、分页查询
  - `services/userService.js` — 注册/登录/密码加密/token 生成
  - `services/categoryService.js`、`tagService.js`、`commentService.js`、`uploadService.js`

- [ ] **2B.2 重构所有 controller**
  - Controller 只负责：解析请求参数 → 调用 service → 返回响应
  - 业务逻辑、数据库查询全部下沉到 service

### 2C. 数据模型 & 查询

- [ ] **2C.1 修复 Slug 生成逻辑**
  - 去掉随机数后缀，改为：生成 slug → 查重 → 重复则追加 `-2`、`-3`
  - Post、Category、Tag 统一使用同一套 slug 工具函数
  - 更新时仅在 title 变化时重新生成 slug

- [ ] **2C.2 引入 Sequelize Migrations**
  - 用 `sequelize-cli` 管理 schema 变更
  - 为当前 schema 生成初始 migration 作为基线
  - 移除 `models/index.js` 中的 `sync({ alter: true })`

- [ ] **2C.3 添加缺失索引**（通过 migration）
  - `posts`: `status`、`categoryId`、`createdAt`，复合索引 `(status, createdAt)`
  - `comments`: `postId`、`userId`

- [ ] **2C.4 优化 N+1 查询**
  - `getAllCategories`/`getAllTags` 不 include 全部 posts，只返回文章计数
  - 详情接口按需加载关联数据，且加分页

- [ ] **2C.5 列表接口添加分页**
  - 统一查询参数：`?page=1&pageSize=10&sort=createdAt&order=desc`
  - `getAllPosts` 必须改为分页（当前返回全量数据）
  - `getAllCategories`/`getAllTags` 预留分页能力

### 2D. 日志

- [ ] **2D.1 引入结构化日志**
  - 引入 `pino` 或 `winston`，替换所有 `console.log`/`console.error`
  - 请求日志中间件、错误日志含 stack trace + request context

**阶段 2 验证：** `npm run dev` 启动无报错 + 所有 API 返回统一格式 `{ success, data, message }` + 列表接口返回 `pagination` + slug 不再包含随机数

**阶段 2 备注：**

---

## 阶段 3：前端架构重构

> 目标：引入状态管理、清理组件、拆分 API 层、改善 UX。

### 3A. 状态管理

- [ ] **3A.1 引入 Pinia**
  - 新建 `client/src/stores/`
  - `stores/auth.js` — token、用户信息、登录/登出
  - `stores/ui.js` — 主题、全局 loading
  - 替换所有直接操作 `localStorage` 的代码

- [ ] **3A.2 重构路由守卫**
  - 使用 Pinia auth store 判断登录/admin 状态
  - 服务端校验 token 有效性
  - 添加 404 兜底路由 + `NotFoundView.vue`

### 3B. 组件整理

- [ ] **3B.1 统一 ArticleCard**
  - 合并 `ArticleCard.vue` 和 `ArticleCardV2.vue`，保留更好的版本

- [ ] **3B.2 拆分大组件**
  - `EditorView.vue` — 抽取图片上传、分类选择为独立 composable/组件
  - `AdminView.vue` — 各管理 tab 改为子路由：
    ```
    /admin              → AdminLayout.vue (侧边栏 + router-view)
    /admin/posts        → PostsManager.vue
    /admin/categories   → CategoriesManager.vue
    /admin/tags         → TagsManager.vue
    /admin/comments     → CommentsManager.vue
    ```

- [ ] **3B.3 整理 CSS**
  - 合并 `index.css` 和 `style.css` 为一个文件
  - 按职责组织：Tailwind directives → 全局基础样式 → 组件样式

### 3C. API 层整理

- [ ] **3C.1 拆分 api/index.js**
  - 按资源拆分为：`api/client.js`(axios 实例)、`api/posts.js`、`api/auth.js`、`api/comments.js` 等
  - 统一错误处理拦截器（401 自动跳登录、网络错误 toast）
  - 清理所有 console.log

### 3D. UX 改善

- [ ] **3D.1 全局错误/加载状态**
  - 请求 loading 指示器
  - 错误 toast 通知

- [ ] **3D.2 编辑器改进**
  - 自动保存草稿到 localStorage
  - 离开页面时未保存提醒

- [ ] **3D.3 生产环境去除 console.log**
  - `vite.config.js` 中 esbuild drop：`esbuild: { drop: ['console', 'debugger'] }`

**阶段 3 验证：** `cd client && npm run dev` 启动无报错 + `npm run build` 构建成功 + 登录/登出/发文/浏览/管理后台页面功能正常

**阶段 3 备注：**

---

## 阶段 4：DevOps 改善

> 目标：精简 Docker 配置、完善 CI/CD、添加代码规范工具。可与阶段 2/3 穿插进行。

- [ ] **4.1 精简 Dockerfile**
  - 合并为：`Dockerfile`(后端 multi-stage) + `client/Dockerfile`(前端 multi-stage)
  - 通过 `--target` 区分 dev/prod
  - 使用非 root 用户运行、添加健康检查

- [ ] **4.2 完善 .gitignore**
  - 确保排除：`.env`、`.DS_Store`、`uploads/`、`*.log`
  - 检查是否有已提交的敏感文件

- [ ] **4.3 配置代码规范工具**
  - ESLint + Prettier（前后端）
  - `husky` + `lint-staged`：提交前自动格式化

- [ ] **4.4 选择部署平台**
  - 候选：阿里云 ECS / AWS Lightsail / Railway / Fly.io / Render
  - 根据预算和运维偏好决定

- [ ] **4.5 重写 CI/CD Pipeline**
  - 根据新平台重写 deploy 阶段
  - 添加 lint 检查 + 测试步骤
  - 添加构建缓存、镜像安全扫描

- [ ] **4.6 生产环境加固**
  - HTTPS 配置
  - 环境变量管理
  - 数据库备份策略

**阶段 4 验证：** `docker compose -f docker-compose.dev.yml up --build` 全部服务启动正常 + lint 通过 + 前后端页面可访问

**阶段 4 备注：**

---

## 阶段 5：测试

> 目标：补充核心测试覆盖。重构稳定后进行。

- [ ] **5.1 后端 API 测试**
  - 工具：`vitest` + `supertest`
  - 优先覆盖：认证流程、文章 CRUD + 权限、输入验证边界值

- [ ] **5.2 前端组件测试**
  - 工具：`vitest` + `@vue/test-utils`
  - 优先覆盖：Pinia stores、路由守卫、关键交互

- [ ] **5.3 E2E 测试（可选）**
  - 工具：Playwright
  - 覆盖：注册 → 登录 → 发文 → 评论 → 管理

**阶段 5 验证：** `npm test` 全部通过 + 覆盖率报告生成

**阶段 5 备注：**

---

## 阶段 6：功能增强（可选）

> 按需选做，不影响核心重构。

| #   | 功能         | 说明                                           |
| --- | ------------ | ---------------------------------------------- |
| 6.1 | SEO 优化     | vue-meta/unhead 管理 meta tags，生成 sitemap   |
| 6.2 | 图片优化     | `sharp` 上传时自动压缩/生成缩略图              |
| 6.3 | Redis 缓存   | 缓存热门文章、分类/标签，减少数据库压力        |
| 6.4 | 软删除       | 文章/评论添加 `deletedAt`，支持回收站          |
| 6.5 | API 文档     | `swagger-jsdoc` + `swagger-ui-express`         |
| 6.6 | 全文搜索     | Elasticsearch / MeiliSearch 替代 SQL LIKE      |
| 6.7 | 文章版本历史 | 每次编辑保存 diff，支持查看和回滚              |

**阶段 6 备注：**

---

## 执行顺序

```
阶段 0（准备清理）
  ↓
阶段 1（安全加固）
  ↓
阶段 2（后端架构）──→ 阶段 4（DevOps）可穿插
  ↓
阶段 3（前端架构）──→ 阶段 4（DevOps）可穿插
  ↓
阶段 5（测试）
  ↓
阶段 6（功能增强）按需选做
```

## 重构原则

1. **渐进式** — 每次改动保持系统可用，不做大爆炸式重写
2. **先修后建** — 先修安全漏洞和 bug，再优化架构
3. **最小改动** — 每步聚焦一个主题，避免混杂无关变更
4. **每步验证** — 完成后在备注区记录结果，标记是否影响后续步骤

---

## 进度追踪

| 阶段   | 状态   | 开始日期 | 完成日期 | Session 数 |
| ------ | ------ | -------- | -------- | ---------- |
| 阶段 0 | 已完成 | 2026-03-25 | 2026-03-25 | 1          |
| 阶段 1 | 进行中 | 2026-03-25 |          |            |
| 阶段 2 | 未开始 |          |          |            |
| 阶段 3 | 未开始 |          |          |            |
| 阶段 4 | 未开始 |          |          |            |
| 阶段 5 | 未开始 |          |          |            |
| 阶段 6 | 未开始 |          |          |            |
