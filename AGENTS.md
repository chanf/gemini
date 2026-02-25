# AGENTS.md

这个文件包含为这个 OpenAI 到 Gemini API 代理服务器项目工作的智能体指南。

## 项目概述

这是一个将 OpenAI API 请求转换为 Google Gemini API 调用的代理服务器，让只支持 OpenAI API 的工具能够使用 Google 的 Gemini 模型（包括免费版的 Gemini 模型）。

核心实现在 `src/worker.mjs` 中，UI 测试控制台在 `src/ui/app.mjs` 中。项目可以部署到多个无服务器平台（Vercel、Netlify、Cloudflare Workers、Deno Deploy）或在本地使用 Node.js、Bun 或 Deno 运行。

## 构建/测试命令

### 开发命令
```bash
# 本地开发（监视模式）
npm run dev          # Node.js（使用 nodemon）
npm run dev:deno     # Deno
npm run dev:bun      # Bun

# 生产本地运行
npm run start        # Node.js
npm run start:deno   # Deno
npm run start:bun    # Bun
```

### 测试命令
```bash
# 运行所有测试
npm test             # 使用 Node.js test runner

# 运行单个测试文件
node --test test/ui.test.mjs

# 运行特定测试
node --test --test-name-pattern="handleUiRequest"
```

### 平台特定部署
```bash
# Vercel
vercel deploy        # 部署
vercel dev           # 本地开发

# Netlify
netlify deploy
netlify dev          # 本地开发

# Cloudflare
wrangler deploy
wrangler dev         # 本地开发
```

## 代码风格指南

### 导入和导出风格
- **ES 模块系统**: 全项目使用 ES 模块（`.mjs` 文件扩展名）
- **导入**: 使用命名导入和默认导入
  ```javascript
  import { Buffer } from "node:buffer";
  import { handleUiRequest } from "./ui/app.mjs";
  ```
- **导出**: 使用命名导出和默认导出
  ```javascript
  export default { /* ... */ };
  export const handleUiRequest = (pathname) => { /* ... */ };
  ```
- **相对路径**: 使用相对路径导入本地模块（`./ui/app.mjs`）
- **绝对路径**: 对 Node.js 内置模块使用绝对路径（`node:buffer`）

### 命名约定
- **变量和函数**: 使用驼峰命名（camelCase）
  ```javascript
  const handleUiRequest = (pathname) => { /* ... */ };
  const apiBase = config.apiBase.replace(new RegExp('/models$'), '');
  ```
- **常量**: 使用大写蛇形命名（SNAKE_CASE）
  ```javascript
  const LOCAL_KEYS = {
    apiBase: 'gemini.ui.apiBase',
    apiKey: 'gemini.ui.apiKey',
    model: 'gemini.ui.model'
  };
  ```
- **类名**: 使用帕斯卡命名（PascalCase）
  ```javascript
  class HttpError extends Error { /* ... */ }
  ```
- **文件名**: 小写，使用连字符分隔
  ```
  worker.mjs
  ui/app.mjs
  ui/chat.mjs
  ui/styles.mjs
  ```

### 格式化规则
- **缩进**: 2 个空格（根据 `.editorconfig`）
- **换行**: LF 换行符（Unix 风格）
- **编码**: UTF-8
- **字符串引号**: 主要使用双引号
- **分号**: 使用分号
- **无尾随空格**: 强制执行
- **末尾换行**: 强制执行

### 错误处理模式
- **自定义错误类**: 创建 `HttpError` 类扩展标准 Error
  ```javascript
  class HttpError extends Error {
    constructor(message, status) {
      super(message);
      this.name = this.constructor.name;
      this.status = status;
    }
  }
  ```
- **错误处理函数**: 使用统一的错误处理函数
  ```javascript
  const errHandler = (err) => {
    console.error(err);
    return new Response(err.message, fixCors({ status: err.status ?? 500 }));
  };
  ```
- **API 错误解析**: 专门的函数解析和显示 API 错误
  ```javascript
  export function parseApiError(errorText) { /* ... */ }
  export function renderError(errorText) { /* ... */ }
  ```

### 代码组织结构
- **模块化设计**: 代码被分割为多个功能模块
  - `worker.mjs`: 核心 API 逻辑
  - `ui/`: 用户界面相关代码
    - `app.mjs`: UI 主入口
    - `chat.mjs`: 聊天功能
    - `models.mjs`: 模型管理
    - `errors.mjs`: 错误处理
    - `markdown.mjs`: Markdown 渲染
    - `styles.mjs`: CSS 样式
- **功能分离**: 每个模块专注于特定功能
- **常量集中**: 常量和配置集中定义

### 其他代码风格特点
- **函数声明**: 混合使用函数声明和箭头函数
  ```javascript
  export async function loadModels(state, elements, config) { /* ... */ }
  const handleOPTIONS = async () => { /* ... */ };
  ```
- **正则表达式**: 使用 `new RegExp()` 构造函数而不是字面量
  ```javascript
  apiBase.replace(new RegExp('/models$'), '');
  ```
- **模板字符串**: 广泛使用模板字符串
- **Promise/async-await**: 使用 async/await 处理异步操作

## 架构要点

### 核心请求流程
1. **请求接收**: worker 导出 `fetch` 处理器接收 HTTP 请求
2. **UI 路由处理**: GET 请求到 `/ui` 通过 `handleUiRequest()` 提供 UI HTML
3. **路由分发**: 根据 pathname 将 API 请求路由到:
   - `/chat/completions` → `handleCompletions()`
   - `/embeddings` → `handleEmbeddings()`
   - `/models` → `handleModels()`
4. **请求转换**: OpenAI 格式请求转换为 Gemini 格式
5. **Gemini API 调用**: 转换后的请求发送到 `generativelanguage.googleapis.com`
6. **响应转换**: Gemini 响应转换回 OpenAI 格式
7. **流式支持**: 对于流式请求，使用 `TransformStream` 管道转换 SSE 格式

### 关键转换映射
- **消息角色**: OpenAI `system` → Gemini `system_instruction`，OpenAI `assistant` → Gemini `model`
- **参数**: OpenAI `max_tokens` → Gemini `maxOutputTokens`，`frequency_penalty` → `frequencyPenalty` 等
- **内容类型**: 支持 `image_url`（获取并 base64 编码）、`input_audio` 等

## 开发注意事项

1. **安全性设置**: 默认情况下，所有安全类别设置为 `BLOCK_NONE` 以允许更灵活的响应
2. **流式响应**: 使用 `TransformStream` 操作链解析 Gemini SSE 并转换为 OpenAI 格式
3. **CORS**: 所有响应包含 CORS 头（`Access-Control-Allow-Origin: *`）
4. **API 密钥**: 通过 `Authorization: Bearer <key>` 头传递并转发为 `x-goog-api-key`
5. **错误处理**: 使用 `HttpError` 类处理 HTTP 错误响应

## 模型选择规则

模型基于 `model` 参数选择：
- 如果名称以 `gemini-`、`gemma-` 或 `models/` 开头：使用该模型
- 否则应用默认值：
  - `chat/completions`: `gemini-flash-latest`
  - `embeddings`: `gemini-embedding-001`

通过在模型名称后附加 `:search` 可以启用网络搜索工具（例如 `gemini-2.5-flash:search`）。

## Gemini 特定功能

使用 `extra_body` 字段传递 Gemini 特定选项：
- `extra_body.google.safety_settings` - 安全配置
- `extra_body.google.cached_content` - 缓存内容使用
- `extra_body.google.thinking_config` - 推理模型的思考模式配置