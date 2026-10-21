# 路由引擎需求与优化

涉及代码：`router/router.ts`、`router/core.ts`、`router/core/*`、`router/watch/*`、`types/router.ts`。

当前机制：

- `router/router.ts` 创建单例 `GlobalPagesRouter`，劫持 `click`、`pushState`、`replaceState`、`popstate`。
- `PagesRouter.navigate/replace/loading` 负责匹配路由、写入 history、执行 `Route.do_load()`。
- `Route.loadjs` 存在时由 `do_load_script()` 插入 `<script type="module">`，加载完成后执行 `hook`；
  不存在时按 `already → before → hook → after` 顺序执行回调。
- 仅查询串变化时走 `Route.Pagination`，不重新 `do_load()`。

---

## R-01 按路由加载对应 JS 文件（`loadjs`）【已实现】

- 状态：✅ 已实现（`router/core/router_map.ts` → `do_load_script()`）
- 现状：
  - 读取 `Route.loadjs`，拼 `?mt_rand=<random>` 后插入 `document.body`，`type="module"`、`async`。
  - 已存在同名脚本时跳过插入，直接执行 `hook`。
  - 加载失败仅 `console.error`。
- 待补齐（并入 R-03）：
  - 已加载检测逻辑实际失效（见 R-03）。
  - 没有超时、重试、并发去重。
  - 没有记录脚本与路由的归属关系，导致无法在离开时清理（见 R-02）。

验收标准：

- [ ] 文档写明 `loadjs` 的写法、执行时机、与 `hook` 的关系。
- [ ] 同一路由重复进入只执行一次脚本（或按配置重新执行）。
- [ ] 加载失败有可观察的错误回调，而不是只打日志。

---

## R-02 路由跳转后默认移除本次加载的 script【新增需求】

- 状态：✅ 已实现（`PageRouter.switch_route` + `Route.do_unload`）
- 需求描述：从路由 A 跳转到路由 B 后，默认移除 A 通过 `loadjs` 加载的 `<script>` 元素，
  避免脚本标签累积、旧页面逻辑残留、内存与事件泄漏。
- 需求边界（默认行为）：
  - **默认开启**，可通过配置关闭；单条路由可覆盖。
  - 只移除由路由引擎插入的脚本（建议用 `data-route` / `data-pages-script` 标记或内部引用），
    不移除页面原有脚本。
  - 仅当 **pathname 发生变化** 时清理；同一路径只改查询串（分页）不清理。
  - `navigate`、`replace`、`loading`、`popstate`、`off()` 删除路由等所有切换入口统一走清理逻辑。
  - 脚本尚未 `onload` 就被切换：应中止后续 `hook` 执行，并移除标签。
  - 加载失败（`onerror`）时也应清理其引用。
  - 目标路由再次进入时允许重新插入并执行（现有 `mt_rand` 参数可绕过缓存）。
- 配置建议（命名待定）：

  ```ts
  new PagesRouter({
    removeLoadedScripts: true, // 默认 true
  });

  router.on("/home", "首页").loadjs = "/examples/home.ts";
  // 单路由保留脚本：
  route.keepLoadedScript = true;
  ```

- 实现建议：
  1. `Route` 增加 `loadedScripts: HTMLScriptElement[]`，插入时保存引用。
  2. `Route` 增加 `do_unload()`：移除脚本元素、清空 `loadedScripts`、重置加载状态。
  3. `PagesRouter` 维护 `currentRoute`，在切换前调用 `prev.leave?.()` 与 `prev.do_unload()`，
     切换完成后再更新 `currentRoute`。
  4. `hook` 执行前校验 `script.isConnected` 且 `currentRoute === this`，避免"迟到回调"。
- 已知限制（需在文档说明）：
  - 移除 `<script>` 不会撤销已执行模块的副作用（全局变量、事件监听、定时器）。
    彻底卸载需要页面模块导出 `cleanup`，由 `Route.leave` 调用。
  - 浏览器对 module 的编译缓存不会因移除标签消失；重新插入时因 URL 带随机参数仍会重新执行。
- 待确认：
  - "移除路由加载的 url"如果指的是**清理地址栏的查询参数**，请改看 R-05.3；当前按"移除 script 标签"理解。
- 验收标准：
  - [ ] 在 `/a`（`loadjs: /a.ts`）跳到 `/b` 后，`document.scripts` 中不再有 `/a.ts`，且 `currentRoute` 为 `/b`。
  - [ ] 从 `/a` 跳到 `/a?page=2` 时脚本不被移除，只触发 `Pagination`。
  - [ ] 浏览器前进/后退来回切换时脚本不重复累积。
  - [ ] 关闭配置 `removeLoadedScripts: false` 时行为与当前版本一致。
  - [ ] 脚本加载中立即切换路由，不执行旧路由的 `hook`。

---

## R-03 脚本加载去重与缓存治理

- 状态：✅ 已实现（`canonicalUrl` + `loadingScript` 复用）
- 问题：
  1. `alreadyLoaded` 用 `s.src.startsWith(baseUrl)` 判断。`script.src` 返回的是**绝对 URL**，
     而 `baseUrl` 是 `/examples/xxx.ts` 这类相对路径，比较结果恒为 `false`，去重实际不生效。
  2. 即使修好前缀比较，`/a.js` 也会误匹配 `/a.jsx`；应比较去掉 query 后的完整 URL。
  3. 每次拼 `?mt_rand=<random>` 会让浏览器无法复用资源缓存，离线/弱网下重复下载。
  4. 脚本加载状态只存在于 DOM，没有按路由记录，无法回答"这个路由加载过哪些文件"。
- 建议：
  - 用 `new URL(loadjs, location.href)` 生成绝对地址，比较时忽略 `search`。
  - 维护 `Map<routePath, Set<scriptUrl>>`，供 R-02 清理与调试面板使用。
  - 随机参数改为可配置：开发环境用时间戳，生产用版本号；或保留 URL 不变、由缓存策略控制。
  - 增加超时（如 10s）与失败重试一次，失败后触发错误回调。
  - 并发进入同一路由时只加载一次（进行中的 Promise 复用）。
- 验收标准：
  - [ ] 同一 `loadjs` 在 `document.scripts` 中最多存在一个（未开启"每次重建"时）。
  - [ ] `/a.js` 与 `/a.jsx` 不会互相误判。
  - [ ] 断网/404 时有明确的错误回调与可配置的超时。

---

## R-04 页面生命周期与 keep-alive 缓存

- 状态：✅ 已实现（keep-alive、滚动恢复、clearKeepAlive）
- 问题：
  - `Route` 定义了 `leave`，但代码中**从未调用**，页面离开无法清理定时器/事件。
  - `popstate` 时直接 `router.loading(href)`，返回上一页会重新执行 `do_load()` 与 `hook`。
  - 没有页面级缓存：返回时滚动位置、表单状态、列表数据全部丢失。
- 需求：
  1. 明确生命周期顺序：`already → before → (loadjs/hook) → after → ... → leave`，
     并保证 `leave` 在成功切换后调用，失败切换时不误清理。
  2. 提供 `keepAlive`（可按路由开启）：缓存页面 DOM 与数据，返回时恢复而不重建。
  3. 记录并恢复 `scrollY`（可接 `history.scrollRestoration`）。
  4. 页面数据的缓存策略：内存缓存 + 过期时间（TTL）+ 手动失效接口。
  5. 前进/后退与普通导航使用同一套生命周期，避免重复加载。
- 验收标准：
  - [ ] `leave` 在每次真实路由切换时恰好执行一次。
  - [ ] 开启 `keepAlive` 的页面返回后 DOM 状态保留，滚动位置恢复。
  - [ ] 未开启 `keepAlive` 的页面返回时行为与当前一致且无重复执行。
- 备注：R-02 的脚本清理与 keep-alive 互斥，需在同一配置中说明优先级。

---

## R-05 查询参数（分页）跳转与 URL 清理

- 状态：✅ 已实现（分页并发补偿、clearSearchOnLeave）
- 现状：`is_only_Pagination()` 判断 pathname 相同且目标带 `search`，命中后只调用 `Pagination`。
- 问题与需求：
  1. 防抖 200ms 期间多次操作会互相取消；`isLoadingPagination` 直接丢弃并发请求，
     没有"最后一次请求补偿"。
  2. `Pagination` 回调是 `() => Promise<void>`，无法拿到当前查询参数，页面需要自己读 `location.search`。
  3. **URL 参数清理**（待确认是否属于 R-02 的另一种解读）：
     - 需求：离开分页/筛选页面时，默认移除本页写入的查询参数，避免参数残留到其他路由。
     - 建议：`clearSearchOnLeave` 配置；或每次导航只保留白名单参数。
  4. 点击 `?uuid=xxx` 这类只改 query 的链接时，应明确使用 `pushState` 还是 `replaceState`
     （当前由 `Route.is_history` 决定，语义不直观）。
- 验收标准：
  - [ ] 连续修改分页时以最后一次为准，回调携带解析后的查询参数。
  - [ ] 从带参数页面跳到无参数页面后，地址栏不残留上一页参数（开启清理时）。
  - [ ] 文档说明 `is_history` 的取值含义。

---

## R-06 导航健壮性与全局事件解绑

- 状态：✅ 已实现（点击过滤、`install/uninstall`、`onNotFound/onError`）
- 问题：
  - `click` 监听对所有 `<a>` 无条件 `preventDefault()`，会吞掉：
    外链新窗口、`download`、`target="_blank"`、`mailto:`/`tel:`、纯 `#hash`、
    Ctrl/Cmd/Shift 点击与鼠标中键。
  - 跨域链接在 `check_url()` 里 `window.open`，但仍被 `preventDefault`，弹窗拦截场景下用户无反馈。
  - `safeURL` 在 `router/core.ts` 与 `router/core/check_url.ts` 各有一份实现。
  - `loading_404` 只 `console.warn`，没有 404 页面或回调。
  - `service_plugin`、`do_redirect.ts`、`do_refresh.ts` 为空文件。
  - `globalThis` 单例 + 模块顶层副作用，无法多实例，也无法在 SSR/测试中安全导入。
- 建议：
  - 点击拦截增加过滤：修饰键、`download`、非 http(s) 协议、空 href、`rel=external`。
  - 提供 `router.onNotFound(cb)` 与可选 404 路由。
  - 抽取统一的 `resolveURL` 工具，删除重复实现。
  - `router/router.ts` 暴露 `install()`/`uninstall()`，避免重复绑定事件。
- 验收标准：
  - [ ] 中键/修饰键点击、外链、下载链接仍保持浏览器默认行为。
  - [ ] 未知路径时能展示 404 视图或触发回调。
  - [ ] 导入路由模块两次不会重复绑定监听。

---

## R-07 动态路由参数与 404 处理

- 状态：✅ 已实现（:param、*、Route.params、onNotFound）
- 现状：`MatchRoute` 只做精确匹配；一级目录且无 `loadjs` 时取第一个子节点，
  不支持 `/user/:id`、通配符、正则等。
- 需求：
  - 支持 `:param` 与 `*` 占位符，匹配结果通过 `hook(params)` 或路由上下文传递。
  - 明确一级目录"自动落到第一个子路由"的规则，并在 README 中说明（当前行为隐蔽且与 `loadjs: ""` 冲突，见 D-03）。
  - 404：区分"路由未注册"与"资源加载失败"，分别回调。
