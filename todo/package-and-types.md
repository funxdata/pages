# 包导出、类型与发布

涉及：`deno.json`、`dytes.json`、`types/*.ts`、`router/types.ts`、`tools/types.ts`、`tpls/types.ts`。

---

## P-01 `exports` 指向可运行实现【P0】

- 状态：✅ 已实现
- 问题：
  - `"./router": "./types/router.ts"` 只导出类型，运行时为空模块，消费者拿不到 `PagesRouter`。
  - `"./tpls": "./tpls/index.ts"`，而该文件内容全部被注释，导出为空。
  - `"./tools"` 指向 `tools/index.ts`（可用），但它依赖全局 `TplToHtml`，隐式前置条件未声明。
- 影响：`deno add jsr:@funxdata/pages` 后按 README 使用 router/tpls 会直接失败。
- 建议（保留旧键，新增明确入口，避免破坏现有使用方）：

  ```jsonc
  {
    "exports": {
      "./router": "./router/core.ts",          // PagesRouter 类
      "./router/browser": "./router/router.ts", // 浏览器入口（自动安装全局监听）
      "./tpls": "./tpls/core.ts",              // Tpl 类
      "./tpls/browser": "./tpls/browser.ts",   // 浏览器入口（globalThis.TplToHtml）
      "./tools": "./tools/index.ts",
      "./types/router": "./types/router.ts",
      "./types/tpls": "./tpls/types/core.ts"
    }
  }
  ```

- 兼容说明：原 `./router` 为空模块，改成实现属于修复而非破坏；`./routtype`、`./tplstype`、`./toolstype`
  可保留一个版本并在 README 标记弃用。
- 验收标准：
  - [ ] `import { PagesRouter } from "jsr:@funxdata/pages/router"` 可实例化。
  - [ ] `import { Tpl } from "jsr:@funxdata/pages/tpls"` 可编译模板。
  - [ ] README 中的示例与 exports 一致。

## P-02 重复类型定义收敛【P1】

- 状态：✅ 已实现（types/* 改为转发）
- 问题：同一份类型存在两处定义，且已经漂移：

  | 类型 | 副本 A | 副本 B |
  | --- | --- | --- |
  | `Route`/`RouteNode`/`PagesRouterInfo` | `types/router.ts` | `router/types.ts` |
  | `paginationtype` | `types/tools.ts` | `tools/types.ts` |
  | `Tpl` | `types/tpls.ts` | `tpls/types.ts` |

  `src/app.ts` 从 `@/router/types.ts` 导入，而 `tools/pagination/index.ts` 从 `@/types/tpls.ts` 导入，
  两份定义可能不同步（例如 `Route` 没有 `child` 字段，导致 `src/app.ts` 报错）。
- 建议：保留一份单一来源（推荐 `router/types.ts`、`tools/pagination/type.ts`、`tpls/types/core.ts`），
  其余文件改为 `export type { ... } from "..."` 的转发，删除复制内容。
- 验收标准：
  - [ ] `rg "export type Route ="` 只命中一处。
  - [ ] 所有 `@/types/*` 与 `@/router/types.ts` 的引用都能正常工作。

## P-03 `tpls` 类型错误清零【P1】

- 状态：✅ 已实现（deno check 通过）
- 现状（`deno check tpls/browser.ts`）：21 个错误，集中在三类：
  1. `tpls/types/core.ts` 的手写 `interface Tpl` 与 `class Tpl` 不兼容，
     `core.ts` 中 8 处 `this` 无法赋给接口类型 (`TS2345`)。
  2. `TemplateFunction<T>` 被声明为 `(tpl: Tpl, data?: T, options?) => string`，
     实际调用是 `tplFn.call(this, data, options)`，参数个数与语义错位，
     导致 `render.ts` 中 `TemplateFunction` 与 `TemplateFunction<T>` 互不兼容。
  3. 泛型默认值缺约束：`<T = Record<string, any>>` 应为
     `<T extends Record<string, any> = Record<string, any>>` (`TS2208`/`TS2344`)。
- 建议：
  - 类型从实现推导，避免双维护：`export type Tpl = InstanceType<typeof TplClass>`。
  - `TemplateFunction` 改为 `(this: Tpl, data?: T, options?: InternalOptions) => string`。
  - 给所有泛型补 `extends` 约束。
- 验收标准：
  - [ ] `deno check tpls/browser.ts tpls/core.ts` 无错误。
  - [ ] `deno check` 全仓入口无错误，并加入 CI（见 Q-02）。

## P-04 版本号与发布元数据同步【P2】

- 状态：✅ 已实现（版本统一为 0.0.27）
- 问题：
  - `deno.json` 为 `0.0.26`，`dytes.json` 为 `1.0.0`。
  - `publish.exe`（约 16MB）被提交进仓库，且 `.gitignore` 只忽略 `publish*`（对已跟踪文件无效）。
  - `assets/browser.js`、`assets/router.js` 是 `deno task pack` 的构建产物，同时被提交，
    容易与源码不同步。
- 需求：
  - 统一版本来源（建议单一 `VERSION` 或构建时注入）。
  - 明确产物提交策略：要么由 CI 生成不提交，要么每次源码变更后重新打包并提交。
  - `dytes.json` 的 `exports` 与 `assets` 产物路径保持对应。
  - 补充 `description`、`repository`、`homepage` 等元数据。
