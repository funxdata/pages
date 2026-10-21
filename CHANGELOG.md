# Changelog

## 0.0.27

### Added

- 路由支持动态参数（`/user/:id`）与通配符（`/files/*`），参数写入 `Route.params`。
- 路由 keep-alive：缓存容器 DOM 与滚动位置，支持 `clearKeepAlive()` 手动失效。
- 新增配置：`removeLoadedScripts`、`cacheBust`、`scriptTimeout`、`keepAlive`、
  `restoreScroll`、`clearSearchOnLeave`、`container`、`onNotFound`、`onError`。
- 模板缓存 `Cacher` 新增 `has`、`keys`、`size`、`clear`。
- 新增单元测试（20+ 用例）与 CI 工作流。
- 演示站新增 404 视图。

### Changed

- 路由切换默认移除上一路由通过 `loadjs` 插入的 `<script>`；
  可用 `keepLoadedScript` 或 `removeLoadedScripts: false` 关闭。
- 脚本按规范化 URL 去重，并发加载复用同一个 Promise，并增加超时与错误回调。
- 点击拦截只处理同源、左键、无修饰键的普通链接；外链/下载/新窗口交回浏览器。
- 包导出指向可运行实现：`./router`、`./tpls`、`./router/browser`、`./tpls/browser`。
- 类型定义收敛为单一来源，`types/*` 改为转发。
- 模板类型从实现推导，`TemplateFunction` 使用 `this` 调用约定。
- 版本号统一为 `0.0.27`（`deno.json` 与 `dytes.json`）。

### Fixed

- 模板解析错误（未闭合标签/字符串）、未注册模板、文件缺失不再被静默忽略。
- 修复 `tpls/file-handling.ts` 引用不存在的 `TplFileResolutionError`。
- 修复演示站 `GlobalPagesRouter` 拼写错误并补上 `init()`。
- 修复 `assets/router.json` 中失效的示例路径。
- `loadjs` 为空字符串时不再被当作已配置。
- 清理空文件与未使用的 `src/rout/*`、`do_redirect`、`do_refresh`、`watch_location`。
