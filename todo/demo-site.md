# 演示站与入口

涉及：`index.html`、`src/**`、`assets/router.json`、`assets/css/base.css`。
说明：`src/` 是文档站演示页面，不包含在 `deno.json` 的发布 exports 中。

---

## D-01 `src/app.ts` 拼写错误与 `init()` 缺失【P0】

- 状态：✅ 已实现
- 问题：
  1. `src/app.ts:19` 使用了未定义的 `GlobalPagesRouter`（前文声明的是 `GlobalPagesRoute`），
     页面初始化时会抛 `ReferenceError`，导致整个文档站无法渲染。
  2. `src/app.ts` 末尾没有调用 `GlobalPagesRoute.init()`，首页不会做初始导航。
     当前只有演示页 `src/router.ts` 调用了 `init()`。
  3. `Route` 类型没有 `child` 字段，`src/app.ts` 读取 `allinfo.child` 时类型报错（见 P-02）。
- 需求：
  - 修正变量名为 `GlobalPagesRoute`（或统一改为 `GlobalPagesRouter`，与 `router/router.ts` 的全局名一致）。
  - 明确首页初始化流程：`router.init(location.href)` 应在路由注册完成后调用一次。
  - 为 `assets/router.json` 定义类型（`RouteGroup[]`，含 `title`、`child: { path, url, title }[]`）。
- 验收标准：
  - [ ] `deno check src/app.ts` 无错误。
  - [ ] `deno task view` 打开首页时侧栏渲染且无控制台报错。
  - [ ] 直接访问 `/about` 等深层路径能正确加载对应 `url`。

## D-02 `assets/router.json` 资源路径失效【P1】

- 状态：✅ 已实现（改为 /examples/about.ts）
- 问题：`/about` 的 `url` 为 `/example/rout/screenshader.ts`，仓库内不存在该路径
  （实际目录为 `examples/`，且没有 `rout/screenshader.ts`），访问 `/about` 会 404。
- 需求：
  - 修正为真实存在的示例文件，或把示例补齐。
  - 加载失败时页面有可见提示（配合 R-03 的错误回调）。
- 验收标准：
  - [ ] `router.json` 中每个 `url` 都能在仓库中找到对应文件。
  - [ ] 增加一条脚本/测试校验 `router.json` 的路径有效性。

## D-03 `loadjs` 空字符串判定【P2】

- 状态：✅ 已实现（空串视为未配置）
- 问题：
  - `src/router.ts` 中 `if (route.loadjs != "" && route.loadjs != "default")`：
    `loadjs` 为 `undefined` 时 `undefined != ""` 为 `true`，会进入分支并赋值。
    这导致 `match.ts` 中"一级目录且 `loadjs === undefined` 时落到第一个子路由"的分支失效。
  - `url: ""` 被写进 `Route.loadjs`，与"未配置"语义混淆。
- 需求：
  - 空字符串统一视为"未配置"，使用 `route.loadjs` 的真值判断。
  - `Route.loadjs` 类型允许 `undefined`，赋值前做规范化。
- 验收标准：
  - [ ] 访问 `/product`（`url: ""`）时按一级目录规则落到 `/product/infos`。
  - [ ] 访问无 `loadjs` 的普通路由不触发脚本加载。

## D-04 空文件与命名冲突清理【P2】

- 状态：✅ 已实现（空文件与未使用的 src/rout/* 已删除）
- 空文件/无内容：
  - `src/views/header.ts`、`src/views/footer.ts`
  - `src/about.ts`
  - `router/core/do_redirect.ts`、`router/core/do_refresh.ts`
  - `router/watch/watch_location.ts`（已实现但未接入）
  - `test/check_url_test.ts`
- 命名冲突：`src/rout/header.ts` 导出的函数名为 `init_footer`（复制粘贴遗留）。
- 需求：删除未使用文件，或补齐实现并接入；修正函数名。
- 验收标准：
  - [ ] 仓库中不再有空 `.ts` 文件（或空文件有明确占位注释与 issue 引用）。
  - [ ] `src/rout/header.ts` 导出 `init_header`。

## D-05 首页骨架与 404 展示【P2】

- 状态：✅ 已实现（404 视图 + 首页占位提示）
- 现状：`index.html` 只挂 `#app`，由 `src/views/main.ts` 注入 `#asides` 与 `#showmain`；
  未匹配路由只 `console.warn`，页面停留在旧内容。
- 需求：
  - 增加加载中骨架与 404 视图（配合 R-06 的 `onNotFound`）。
  - `index.html` 中同时加载 `/tpls/browser.ts` 与 `/router/router.ts`，
    需在 README 说明开发入口与 `assets/*.js` 打包产物的对应关系。
  - 文档站应展示 R-02 的效果（切换页面后旧脚本被移除），便于验收。
