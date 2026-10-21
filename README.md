# @funxdata/pages

面向浏览器的单页路由与模板引擎，配套 FunxData 文档站使用。

- 路由：`router/`，支持 History API 导航、按路由加载 JS、脚本清理、keep-alive、动态参数。
- 模板：`tpls/`，EJS 风格语法，支持转义插值、`include`、`layout`、同步/异步渲染。
- 工具：`tools/`，目前提供分页组件。

## 安装

```bash
deno add jsr:@funxdata/pages
```

## 快速开始（浏览器）

在页面中按顺序加载入口模块：

```html
<script type="module" src="/tpls/browser.ts"></script>
<script type="module" src="/router/router.ts"></script>
<script type="module" src="/src/app.ts"></script>
```

入口会挂载两个全局实例：

- `globalThis.TplToHtml`：模板引擎实例（`cache: true`）。
- `globalThis.GlobalPagesRouter`：路由实例。

注册路由并在注册完成后执行首次导航：

```ts
const route = GlobalPagesRouter.on("/home", "首页");
route.loadjs = "/pages/home.ts"; // 进入路由时动态加载
route.hook = () => {
  // 页面初始化
};
GlobalPagesRouter.init();
```

## 路由

### `PagesRouter`

```ts
import { PagesRouter } from "@funxdata/pages/router";

const router = new PagesRouter({
  removeLoadedScripts: true, // 离开路由时移除本次加载的 script（默认 true）
  cacheBust: true, // 脚本 URL 追加随机参数（默认 true）
  scriptTimeout: 10_000, // 脚本加载超时（毫秒）
  keepAlive: false, // 全局开启 keep-alive
  restoreScroll: false, // 恢复滚动位置
  clearSearchOnLeave: false, // 离开页面时清理查询参数
  container: "#showmain", // keep-alive 容器（选择器或元素）
  onNotFound: (url) => {}, // 未匹配路由
  onError: (err) => {}, // 统一错误回调
});
```

| 方法 | 说明 |
| --- | --- |
| `on(path, title)` | 注册路由，返回 `Route` |
| `off(path)` | 移除路由 |
| `search(path)` | 查找路由（支持动态路由） |
| `navigate(url)` | 写入 history 并加载页面 |
| `replace(url)` | 替换当前 history 并加载页面 |
| `loading(url)` | 只加载页面，不写 history |
| `init(url?)` | 首次导航 |
| `clearKeepAlive(path?)` | 清理 keep-alive 缓存 |

### `Route`

| 字段/方法 | 说明 |
| --- | --- |
| `pathname` | 路由路径，支持 `/user/:id`、`/files/*` |
| `params` | 动态路由参数，如 `{ id: "42" }` |
| `loadjs` | 进入路由时加载的脚本 |
| `hook` | 页面初始化回调 |
| `already` / `before` / `after` | 生命周期回调，顺序：already → before → hook → after |
| `leave` | 离开路由时执行 |
| `Pagination` | 仅查询串变化时执行 |
| `keepLoadedScript` | 离开时保留本路由加载的脚本 |
| `keepAlive` | 缓存本路由的 DOM（需配置 `container`） |
| `is_history` | `1` 使用 pushState，其它值使用 replaceState |
| `do_load()` / `do_unload()` | 手动加载/清理 |

### 脚本加载与清理

启用 `loadjs` 后，路由会插入 `<script type="module">`，加载完成后执行 `hook`。
脚本按规范化 URL 去重，并发进入同一路由只加载一次。

默认在 pathname 变化的切换中移除上一路由插入的 `<script>`。以下情况不会移除：

- 路由设置 `keepLoadedScript = true`；
- 命中的页面处于 keep-alive 状态；
- 全局关闭 `removeLoadedScripts`。

> 移除 `<script>` 不会撤销已执行模块的副作用（全局变量、事件监听、定时器）。
> 需要彻底卸载时，请在 `leave` 中清理。

### 动态路由

```ts
router.on("/user/:id", "用户");
router.on("/files/*", "文件");

const route = router.search("/user/42");
route?.params.id; // "42"
```

精确路由优先于动态路由。动态参数每个导航周期写入对应 `Route` 实例。

### keep-alive

```ts
const router = new PagesRouter({
  keepAlive: true,
  container: "#showmain",
  restoreScroll: true,
});
router.on("/list", "列表").keepAlive = true;
```

离开时保存容器 `innerHTML` 与滚动位置，返回时恢复并跳过 `hook`。
调用 `router.clearKeepAlive("/list")` 可让下次进入重新构建。

## 模板

```ts
import { Tpl } from "@funxdata/pages/tpls";

const tpl = new Tpl({ views: "./views", cache: true });
tpl.renderString("Hello <%= it.name %>", { name: "A" });
tpl.render("./page", { name: "A" });
```

浏览器端使用全局实例：

```ts
await TplToHtml.renderString("<%= it.title %>", { title: "A" });
TplToHtml.loadTemplate("header", "<h1><%= it.title %></h1>");
await TplToHtml.renderString("<%~ include('header', it) %>", { title: "A" });
```

| 语法 | 说明 |
| --- | --- |
| `<%= expr %>` | 转义插值 |
| `<%~ expr %>` | 原样输出 |
| `<% code %>` | 执行 JS |
| `include(name, data)` | 渲染已注册模板 |
| `layout(name, data)` | 使用布局模板 |

常用配置：`autoEscape`、`autoTrim`、`cache`、`views`、`defaultExtension`、`debug`、`useWith`。

## 开发

```bash
deno task view      # 启动文档站
deno task pack      # 打包 router/browser 入口到 assets/
deno task release   # 上传 assets/
deno test --allow-read test/
deno check router/router.ts router/core.ts tpls/browser.ts tpls/index.ts \
  src/app.ts src/router.ts src/tpls.ts
```

`assets/browser.js` 与 `assets/router.js` 是 `deno task pack` 的产物；
修改对应源码后需要重新打包并提交（或由发布流程生成）。

## 目录

```
router/   路由引擎（core.ts 为可导入实现，router.ts 为浏览器入口）
tpls/     模板引擎（index.ts 为 Deno 端，browser.ts 为浏览器入口）
tools/    工具（分页）
src/      文档站演示页面
examples/ 示例脚本与模板
test/     单元测试
todo/     需求池与未完成事项
```
