# 模板引擎需求与优化

涉及代码：`tpls/*.ts`、`tpls/types/*.ts`。

当前能力：EJS 风格语法（`<%= 转义插值 %>`、`<%~ 原样输出 %>`、`<% 代码 %>`）、
`include`/`includeAsync`、`layout`、同步/异步编译、模板缓存、插件钩子、
引号/注释感知的标签解析、debug 行号、XSS 默认转义。

---

## T-01 解析错误必须抛出【P1】

- 状态：✅ 已实现（实例方法改为抛出 TplParseError，含行列号）
- 问题：`parse.ts` 调用 `this.TplErr.TplParseError(msg, str, index)`，
  但实例方法只接收一个参数、只设置 `name/message` 后 `return this`，**不会 throw**。
  真正抛错的是静态方法 `TplError.ParseError`。结果是未闭合标签、未闭合字符串等错误被静默忽略。
- 需求：
  - 实例方法与静态方法职责统一：实例方法要么抛出，要么删除。
  - 错误信息保留 line/col 与上下文片段（静态 `ParseError` 已实现该格式）。
  - `types/err.ts` 的签名与实际实现对齐（当前声明 3 个参数，实现 1 个）。
- 验收标准：
  - [ ] `tpl.compile("<% foo")` 抛出 `TplParseError`，消息包含行号与列号。
  - [ ] 未闭合字符串、未闭合注释各有独立测试。

## T-02 模板缓存与失效策略【P2】

- 状态：✅ 已实现（Cacher 新增 has/keys/size/clear）
- 现状：`Cacher` 为普通对象；`config.cache` 默认 `false`；`browser.ts` 中实例开启 `cache: true`；
  `filepathCache` 依赖 `cacheFilepaths`。
- 问题：
  - 缓存只有 `reset/remove`，没有容量上限与按模板名失效的批量接口。
  - `handleCache` 中 `template.startsWith("@")` 的分支含义不明（看起来像保留语法）。
  - 同名模板的同步/异步缓存分开存放，容易出现"只注册了同步版本，异步渲染取不到"。
- 需求：
  - 提供 `invalidate(name)`、`clear()`、可选 LRU 上限。
  - `loadTemplate` 同时注册同步/异步版本，或文档明确二者的区别。
  - 文件模板缓存键包含 `views + filepath`，避免多实例串用。

## T-03 文件路径解析与浏览器端接入【P2】

- 状态：✅ 已实现（恢复 tpls/index.ts，组合 readFile/resolvePath）
- 问题：
  - `file-handling.ts` 提供 `readFile`/`resolvePath`，但 `tpls/index.ts` 已整体注释，
    `Tpl` 构造器中仍是 `readFile` 抛错的占位实现，浏览器端无法读文件模板。
  - `examples/render.ts`、`examples/tpl_sample.ts` 均 `import { Tpl } from "@/tpls/index.ts"`，当前无法编译。
- 需求：
  - 决定 `Tpl` 的对外入口：
    - 浏览器：`globalThis.TplToHtml`（`tpls/browser.ts`）+ `loadTemplate`；
    - Deno/Node：从 `tpls/core.ts` 组合 `file-handling.ts` 的 `readFile/resolvePath`。
  - 恢复 `tpls/index.ts` 的导出（或删除该文件并更新示例与 `deno.json` 的 `exports`）。
  - 浏览器端 `include` 采用已注册模板名，文件读取保持 Deno 专用。

## T-04 错误类型与调试信息统一【P2】

- 状态：✅ 已实现（实例方法统一抛出，file-handling 走 TplError 工厂）
- 问题：
  - `TplError` 同时存在实例方法 `TplParseError/TplRuntimeError/TplNameResolutionError` 与静态工厂
    `ParseError/RuntimeError/NameResolutionError/FileResolutionError`，命名接近但行为不同。
  - `compile()` 捕获 `SyntaxError` 时调用实例方法，错误对象是 `TplError` 而非专用子类。
  - `render.ts` 在模板未找到时先调用实例方法（不抛），随后又 `throw new Error`，产生两条错误路径。
- 需求：
  - 统一为 `TplParseError` / `TplRuntimeError` / `TplNameResolutionError` / `TplFileResolutionError` 四个类。
  - 所有抛出点带 `name`、`message`、`cause`、可选 `lineNo`、`filepath`。
  - `debug: true` 时的行号追踪不要影响生产路径的性能。

## T-05 模板引擎单元测试【P1】

- 状态：✅ 已实现（test/tpls_test.ts，5 个用例）
- 覆盖点：
  - 解析：插值/原样/执行、转义、`%>` 出现在字符串或注释中、未闭合错误。
  - 编译：同步/异步、`include`、`layout`、`useWith`、`autoTrim`、`rmWhitespace`。
  - 渲染：缓存命中、未注册模板报错、`autoEscape` 的 XSS 用例。
  - `Cacher`：define/get/remove/reset/load。
