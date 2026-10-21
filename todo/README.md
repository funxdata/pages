# Pages 项目需求池（TODO）

本目录用于沉淀 `@funxdata/pages` 的功能需求、缺陷修复与重构事项，不参与构建和发布。

- 整理时间：2026-10-21
- 代码基线：`main` @ `bb84a18`
- 当前状态（2026-10-21）：`deno check` 全量入口通过；`deno test --allow-read test/` 共 20 个用例通过。

## 状态与优先级

| 标记 | 含义 |
| --- | --- |
| ✅ | 已完成（实现 + 验证） |
| 🟡 | 部分完成，或需求边界待确认 |
| ⬜ | 待实现 |
| 🔁 | 重构/优化 |

优先级：`P0` = 阻断或线上可见错误；`P1` = 影响主要功能或后续迭代；`P2` = 体验、可维护性优化。

## 索引入口

| 文档 | 范围 |
| --- | --- |
| [router.md](./router.md) | 路由引擎：脚本加载、跳转后清理、缓存、生命周期、分页 |
| [tpls.md](./tpls.md) | 模板引擎：解析、编译、渲染、缓存、错误 |
| [package-and-types.md](./package-and-types.md) | 包导出、类型定义、版本与发布元数据 |
| [demo-site.md](./demo-site.md) | `src/` 演示站与 `index.html` 入口 |
| [quality.md](./quality.md) | 测试、CI、仓库清理与文档 |

## 总览

| ID | 标题 | 优先级 | 状态 |
| --- | --- | --- | --- |
| R-01 | 按路由加载对应 JS 文件（`loadjs`） | P1 | ✅ |
| R-02 | 路由跳转后默认移除本次加载的 script | P1 | ✅ |
| R-03 | 脚本加载去重与缓存治理 | P1 | ✅ |
| R-04 | 页面生命周期与 keep-alive 缓存 | P1 | ✅ |
| R-05 | 查询参数（分页）跳转与 URL 清理 | P2 | ✅ |
| R-06 | 导航健壮性与全局事件解绑 | P1 | ✅ |
| R-07 | 动态路由参数与 404 处理 | P2 | ✅ |
| T-01 | 解析错误必须抛出 | P1 | ✅ |
| T-02 | 模板缓存与失效策略 | P2 | ✅ |
| T-03 | 文件路径解析与浏览器端接入 | P2 | ✅ |
| T-04 | 错误类型与调试信息统一 | P2 | ✅ |
| T-05 | 模板引擎单元测试 | P1 | ✅ |
| P-01 | `exports` 指向可运行实现 | P0 | ✅ |
| P-02 | 重复类型定义收敛 | P1 | ✅ |
| P-03 | `tpls` 类型错误清零 | P1 | ✅ |
| P-04 | 版本号与发布元数据同步 | P2 | ✅ |
| D-01 | `src/app.ts` 拼写错误与 `init()` 缺失 | P0 | ✅ |
| D-02 | `assets/router.json` 资源路径失效 | P1 | ✅ |
| D-03 | `loadjs` 空字符串判定 | P2 | ✅ |
| D-04 | 空文件与命名冲突清理 | P2 | ✅ |
| D-05 | 首页骨架与 404 展示 | P2 | ✅ |
| Q-01 | 建立测试体系 | P1 | ✅ |
| Q-02 | CI 增加质量门禁 | P1 | ✅ |
| Q-03 | 仓库清理（构建产物/二进制） | P2 | 🟡 |
| Q-04 | README 与变更日志 | P2 | ✅ |

## 本轮已落地

- **P-01**：`deno.json` 的 `./router` 指向 `router/core.ts`，新增 `./router/browser`、`./tpls/browser`；
  `tpls/index.ts` 恢复导出 `Tpl`（组合文件读取能力）。
- **R-02**：`PagesRouter` 维护 `currentRoute`，切换时调用 `Route.leave` 并执行 `Route.do_unload()`，
  默认移除上一路由通过 `loadjs` 插入的 `<script>`；支持 `keepLoadedScript` 与
  `removeLoadedScripts: false`。
- **R-03**：脚本按规范化 URL 去重（修复 `startsWith` 误判），并发加载复用同一 Promise，
  支持超时与 `onLoadError`。
- **R-04**：`leave` 已接入；keep-alive（容器 DOM + 滚动位置）与 `clearKeepAlive()` 已完成。
- **R-05**：分页请求在加载中再次触发会补执行一次；`clearSearchOnLeave` 可清理地址栏参数。
- **R-07**：支持 `/user/:id` 与 `/files/*`，参数写入 `Route.params`，精确路由优先。
- **T-02**：`Cacher` 新增 `has/keys/size/clear`，支持缓存失效与调试。
- **D-05**：演示站 `onNotFound` 渲染 404 视图，首页增加占位提示。
- **P-04**：`deno.json` 与 `dytes.json` 版本统一为 `0.0.27`。
- **Q-04**：README 补齐安装、路由 API、模板 API、开发命令；新增 CHANGELOG。
- **R-06**：点击只接管同源左键普通链接；`install()/uninstall()` 可解绑全局监听；
  新增 `onNotFound`/`onError`。
- **T-01/T-04**：解析错误、未注册模板、文件缺失都会抛出带 `name` 的错误。
- **P-02/P-03**：类型定义收敛为单一来源，`tpls` 的 21 个类型错误清零。
- **D-01~D-04**：演示站拼写与 `init()`、`router.json` 路径、`loadjs` 空串、空文件清理完成。
- **Q-01/Q-02**：新增 5 个测试文件共 20 个用例，新增 `.github/workflows/ci.yml`。

验证命令：

```bash
deno check router/router.ts router/core.ts tpls/browser.ts tpls/index.ts src/app.ts src/router.ts src/tpls.ts
deno test --allow-read test/
```

## 建议下一步

1. **Q-03 剩余**：确认 `assets/*.js` 构建产物是继续提交还是改为 CI 生成。
2. 可选增强：`Cacher` 的 LRU 上限、分页组件测试、真实浏览器 E2E。
3. 发布前重新执行 `deno task pack`，确保 `assets/browser.js`、`assets/router.js` 与源码同步。
