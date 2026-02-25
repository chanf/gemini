## 为什么需要这个项目

Gemini API 提供[免费](https://ai.google.dev/gemini-api/docs/pricing#free)额度，限制相当宽松，但很多工具仍然只支持 OpenAI API。

本项目提供了一个免费的个人 OpenAI 兼容端点。


## 无服务器？

虽然运行在云端，但不需要服务器维护。
可以轻松部署到各大提供商，免费额度足够个人使用。

> [!TIP]
> 本地运行代理端点也是[可行方案](#本地运行---node-deno-bun)！


## 工作原理

这个代理充当 OpenAI 和 Gemini API 之间的**翻译器**。核心实现是单个文件 ([`src/worker.mjs`](src/worker.mjs))，可以部署到任何无服务器平台或在本地运行。

```
┌─────────────────┐     OpenAI 格式        ┌─────────────────┐     Gemini 格式        ┌──────────────┐
│   客户端工具     │ ─────────────────────▶  │   本代理服务     │ ─────────────────────▶  │ Gemini API   │
│ (ChatGPT 等)    │                         │   (单文件)      │                         │              │
│                 │ ◀─────────────────────  │                 │ ◀─────────────────────  │              │
└─────────────────┘     OpenAI 格式        └─────────────────┘     Gemini 格式        └──────────────┘
```

### 架构设计

整个代理逻辑都在一个文件中，包含以下关键组件：

1. **请求路由** - 根据端点分发请求 (`/chat/completions`、`/embeddings`、`/models`)

2. **请求转换** ([`transformRequest`](src/worker.mjs:523)) - 将 OpenAI 格式转换为 Gemini 格式：
   - 消息角色：`system` → `system_instruction`、`assistant` → `model`、`tool` → `functionResponse`
   - 参数映射：`max_tokens` → `maxOutputTokens`、`temperature`、`top_p` 等
   - 内容类型：图片/音频 → Gemini `inlineData` 格式
   - 工具调用：函数声明和配置转换

3. **API 调用** - 将转换后的请求转发到 `generativelanguage.googleapis.com`

4. **响应转换** ([`processCompletionsResponse`](src/worker.mjs:643)) - 将 Gemini 响应转换回 OpenAI 格式

5. **流式支持** - 对于流式请求，使用 `TransformStream` 管道处理：
   ```
   Gemini SSE → 解析数据块 → 转换为 OpenAI 格式 → 编码输出
   ```

### 平台适配器

每个运行时都有一个最小的适配器，导入核心工作线程：

| 运行时  | 适配器文件 | 实现方式 |
|----------|--------------|----------------|
| Node.js  | [`node.mjs`](node.mjs) | `@whatwg-node/server` 适配器 |
| Bun      | [`bun.mjs`](bun.mjs) | 原生 `Bun.serve()` |
| Deno     | [`deno.mjs`](deno.mjs) | `Deno.serve()` |
| Vercel   | [`api/handler.mjs`](api/handler.mjs) | Edge Runtime |
| Cloudflare | [`src/worker.mjs`](src/worker.mjs) | 直接导出 `fetch` |
| Netlify  | [`netlify/edge-functions/handler.mjs`](netlify/edge-functions/handler.mjs) | Edge Function |

所有适配器复用相同的核心逻辑，零代码重复。


## 快速开始

你需要一个个人 Google [API 密钥](https://aistudio.google.com/app/api-keys)。

> [!IMPORTANT]
> 即使你不在[支持区域](https://ai.google.dev/gemini-api/docs/available-regions#available_regions)内，
> 仍然可以使用 VPN 获取密钥。

使用下面的说明将项目部署到你选择的提供商。
你需要在那里注册一个账户。

如果选择"一键部署"，系统会引导你先 fork 仓库，
这是持续集成 (CI) 所必需的。


### 部署到 Vercel

 [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PublicAffairs/openai-gemini&repository-name=my-openai-gemini)
- 或者可以使用 [cli](https://vercel.com/docs/cli) 部署：
  `vercel deploy`
- 本地运行：`vercel dev`
- Vercel _Functions_ [限制](https://vercel.com/docs/functions/limitations) (使用 _Edge_ 运行时)


### 部署到 Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/PublicAffairs/openai-gemini&integrationName=integrationName&integrationSlug=integrationSlug&integrationDescription=integrationDescription)
- 或者可以使用 [cli](https://docs.netlify.com/cli/get-started/) 部署：
  `netlify deploy`
- 本地运行：`netlify dev`
- 提供两个不同的 API 基础路径：
  - `/v1` (例如 `/v1/chat/completions` 端点)
    _Functions_ [限制](https://docs.netlify.com/build/functions/get-started/#synchronous-function)
  - `/edge/v1`
    _Edge functions_ [限制](https://docs.netlify.com/build/edge-functions/limits/)


### 部署到 Cloudflare

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/PublicAffairs/openai-gemini)
- 或者可以手动部署，将 [`src/worker.mjs`](src/worker.mjs) 的内容
  粘贴到 https://workers.cloudflare.com/playground (见那里的 `Deploy` 按钮)。
- 或者可以使用 [cli](https://developers.cloudflare.com/workers/wrangler/) 部署：
  `wrangler deploy`
- 本地运行：`wrangler dev`
- _Worker_ [限制](https://developers.cloudflare.com/workers/platform/limits/#worker-limits)


### 部署到 Deno

详细信息见[这里](https://github.com/PublicAffairs/openai-gemini/discussions/19)。


### 本地运行 - 使用 Node、Deno、Bun

仅 Node 需要：`npm install`

然后运行 `npm run start` / `npm run start:deno` / `npm run start:bun`


#### 开发模式 (监听源代码变化)

仅 Node 需要：`npm install --include=dev`

然后运行：`npm run dev` / `npm run dev:deno` / `npm run dev:bun`


## 如何使用

如果你在浏览器中直接打开根路径（`/`），仍然会看到 `404 Not Found`，这是预期行为；
但现在你也可以访问内置测试页面：`/ui`。

要在第三方软件中使用该代理，你需要在软件设置的相应字段中输入 API 地址和 Gemini API 密钥。

> [!NOTE]
> 并非所有软件工具都允许覆盖 OpenAI 端点，但很多工具支持
> (不过这些设置有时可能隐藏得很深)。

通常，你应该按以下格式指定 API 基础地址：
`https://my-super-proxy.vercel.app/v1`

相关字段可能标记为"_OpenAI 代理_"。
你可能需要在"_高级设置_"或类似部分中查找。
或者，它可能在某个配置文件中（详细信息请查看相关文档）。

对于某些命令行工具，你可能需要设置环境变量，例如：
```sh
OPENAI_BASE_URL="https://my-super-proxy.vercel.app/v1"
```
_..或者_：
```sh
OPENAI_API_BASE="https://my-super-proxy.vercel.app/v1"
```

### 内置测试页面（`/ui`）

访问部署地址后的 `/ui` 路径（例如 `https://your-worker.example.com/ui`）即可打开测试控制台。

**功能特性：**

- **连接配置**
  - API Key 输入和保存（存储在 `localStorage`）
  - 自定义 API Base URL（默认自动检测为当前站点的 `/v1`）
  - 完整 URL 示例提示：`https://your-worker.example.com/v1`

- **模型管理**
  - 拉取并展示可用模型列表（`GET /models`）
  - 模型搜索过滤功能
  - 一键选择聊天模型

- **聊天界面**
  - 流式/非流式响应切换
  - 实时消息计数显示
  - 停止生成功能
  - 基础 Markdown 渲染（支持代码块、链接、粗体、斜体等）
  - 清空会话历史

- **数据存储**
  - API 配置保存在浏览器 `localStorage`（持久化）
  - 聊天历史保存在 `sessionStorage`（关闭浏览器自动清除）


## 模型

如果模型名称以 "gemini-"、"gemma-" 或 "models/" 开头，则使用指定的[模型](https://ai.google.dev/gemini-api/docs/models)。
否则，应用以下默认值：

- `chat/completions`：`gemini-flash-latest`
- `embeddings`：`gemini-embedding-001`


## 内置工具

要使用 **网络搜索** 工具，请在模型名称后追加 ":search"
(例如 "gemini-2.5-flash:search")。

注意：`annotations` 消息属性未实现。


## 媒体支持

按照 OpenAI [规范](https://platform.openai.com/docs/api-reference/chat/create)支持 [视觉](https://platform.openai.com/docs/guides/images-vision?api-mode=chat&format=url#giving-a-model-images-as-input)和 [音频](https://platform.openai.com/docs/guides/audio?example=audio-in&lang=curl#add-audio-to-your-existing-application)输入。
通过 [`inlineData`](https://ai.google.dev/api/caching#Part) 实现。


## Gemini 特定功能

有几个 Gemini 支持的功能在 OpenAI 模型中不可用，
但可以使用 `extra_body` 字段启用。
最值得注意的是 [`thinking_config`](https://ai.google.dev/gemini-api/docs/openai#thinking)。

更多详情请参考 [Gemini API 文档](https://ai.google.dev/gemini-api/docs/openai#extra-body)。

---

## 支持的 API 端点和适用参数

- [x] `chat/completions`

  目前，两个 API 都适用的大部分参数都已实现。
  <details>

  - [x] `messages`
      - [x] `content`
      - [x] `role`
          - [x] "system" (=>`system_instruction`)
          - [x] "user"
          - [x] "assistant"
          - [x] "tool"
      - [x] `tool_calls`
  - [x] `model`
  - [x] `frequency_penalty`
  - [ ] `logit_bias`
  - [ ] `logprobs`
  - [ ] `top_logprobs`
  - [x] `max_tokens`、`max_completion_tokens`
  - [x] `n` (`candidateCount` <8，不支持流式)
  - [x] `presence_penalty`
  - [x] `reasoning_effort`
  - [x] `response_format`
      - [x] "json_object"
      - [x] "json_schema" (OpenAPI 3.0 schema 对象的子集)
      - [x] "text"
  - [x] `seed`
  - [x] `stop`：字符串或数组 (`stopSequences` [1,5])
  - [x] `stream`
  - [x] `stream_options`
      - [x] `include_usage`
  - [x] `temperature` (OpenAI 为 0.0..2.0，但 Gemini 支持更高)
  - [x] `top_p`
  - [x] `tools`
  - [x] `tool_choice`
  - [ ] `parallel_tool_calls` (Gemini 中始终启用)
  - [x] [`extra_body`](#gemini-特定功能)

  </details>
- [ ] `completions`
- [x] `embeddings`
  - [x] `dimensions`
- [x] `models`
