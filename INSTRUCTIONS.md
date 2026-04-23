# 🤖 项目全局架构与 AI 编码规范指南

> **致 AI 助手**：请严格遵守以下架构定义与编码规范。你的任何代码生成、重构和建议都必须以本指南为最高准则。不要使用过时的语法或违背本项目技术栈组合的实现方式。

## 1. 核心技术栈概览 (Tech Stack)
本项目是一个现代化的前后端分离全栈应用。

* **前端 (Frontend)**: Next.js (App Router), React, TypeScript, Tailwind CSS **v4**, shadcn/ui.
* **后端 (Backend)**: FastAPI, Python 3.10+, Pydantic v2, SQLAlchemy 2.0 (异步模式).
* **数据存储 (Infrastructure)**: PostgreSQL, Redis.

---

## 2. 前端开发规范 (Frontend Rules)

### 2.1 ⚠️ 绝对禁令：Tailwind CSS V4
* **严禁生成 `tailwind.config.js` 或 `tailwind.config.ts`**。
* 本项目使用 **Tailwind CSS v4**。所有的自定义主题、变量和插件配置，必须通过 CSS 变量形式编写在全局样式文件（如 `app/globals.css`）中，使用 `@theme` 指令。
* **不要**使用旧版 Tailwind 的配置逻辑。

### 2.2 Next.js App Router 约束
* 默认所有组件都是 **Server Components (服务端组件)**。
* 只有当组件需要处理用户交互（`onClick`）、使用 React Hooks（`useState`, `useEffect`）或访问浏览器 API 时，才在文件顶部添加 `"use client"` 指令。
* **性能优化**：尽量将 Client Components 保持在组件树的叶子节点，避免将整个页面标记为 `"use client"`。

### 2.3 UI 组件库 (shadcn/ui)
* 优先使用基于 Radix UI 和 Tailwind 的 shadcn/ui 组件。
* 如果在生成代码时需要新的 UI 组件，请提示我运行对应的 `npx shadcn@latest add [component]` 命令，而不是你自己手动从头实现复杂的基础组件。

---

## 3. 后端开发规范 (Backend Rules)

### 3.1 现代 Python 生态
* **严格使用 Pydantic V2** 进行数据验证和序列化，禁止使用 V1 的旧 API（如避免使用 `.dict()`，应使用 `.model_dump()`）。
* **ORM 框架**：使用 SQLAlchemy 2.0 语法。必须采用 `asyncio` 异步模式与数据库交互（使用 `asyncpg` 驱动）。禁止使用同步的数据库查询阻塞事件循环。

### 3.2 FastAPI 架构
* 路由必须模块化（使用 `APIRouter`）。
* 每个 API 必须有明确的入参 Schema 和返回值 Schema，利用 FastAPI 的依赖注入（`Depends`）处理鉴权和数据库会话。
* 耗时任务（如文件处理、邮件、AI 调用）严禁阻塞主线程，必须交由 Redis + 任务队列（如 Celery 或纯异步后台任务 `BackgroundTasks`）处理。

---

## 4. 前后端通信与类型对齐 (API & Type Safety)

前后端分别使用 TypeScript 和 Python，为了防止类型断层，必须遵循以下契约：
* **API 文档即真理**：后端的 OpenAPI schema (`/openapi.json`) 是唯一的数据契约来源。
* **前端请求约束**：前端代码在调用后端 API 时，必须指明明确的 TypeScript 接口（Interface/Type）。
* **在重构后端返回值时**，AI 必须主动提醒并同步更新前端发起请求的响应类型定义。

---

## 5. AI 行为准则 (AI Execution Directives)

当执行我的自然语言指令时，请遵循以下思考路径：

1.  **先思考，后输出**：在编写长段代码前，先用一两句话简述你的实现思路和涉及的文件。
2.  **避免破坏性修改**：如果指令涉及修改核心逻辑，请先阅读相关依赖文件，确保不会破坏全局状态或破坏现有组件。
3.  **精确修改**：只输出需要修改的代码块，如果文件很长，不要重写整个文件，请使用注释（如 `// ... 现有代码保持不变`）省略未修改的部分。
4.  **无环境假设**：不要假设我已经安装了某个 npm 包或 pip 库。如果你引入了新的依赖，必须在回复末尾明确列出需要执行的安装命令。
5.  **遇到不确定的 API 契约时**，停止猜测，向我提问确认前后端的数据结构。