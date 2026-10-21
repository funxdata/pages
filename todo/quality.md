# 测试、CI、仓库与文档

---

## Q-01 建立测试体系【P1】

- 状态：✅ 已实现（test/ 下 5 个文件、20 个用例）
- 现状：仅存在 `test/check_url_test.ts`，内容为空，项目**没有任何测试**。
- 需求：
  - 使用 `@std/assert`（`deno.json` 已引入）编写单元测试。
  - 优先覆盖纯逻辑：
    - `router/core/check_url.ts`：`is_only_Pagination`、`check_url`、`safeURL`。
    - `router/core/route_node.ts`：`add_node` / `search_node` / `delete_node`。
    - `router/core/match.ts`：一级目录规则。
    - `tpls`：`parse` / `compile` / `render` / `Cacher`（见 T-05）。
    - `tools/pagination`：页数计算、边界值、回调次数。
  - 浏览器相关逻辑（history、DOM）使用 `deno test --allow-all` + `jsdom` 或
    把逻辑抽成可注入 `location/history` 的纯函数。
- 命令：`deno test --allow-read --allow-net test/`。
- 验收标准：
  - [ ] 新增测试可本地与 CI 运行。
  - [ ] 关键纯函数行覆盖率有统计（可选）。

## Q-02 CI 增加质量门禁【P1】

- 状态：✅ 已实现（.github/workflows/ci.yml：deno check + deno test）
- 现状：`.github/workflows/release.yml` 只在 push `main` 时打包上传，不执行任何检查。
- 需求：新增 `ci.yml`（或在 release 前加步骤）：
  - `deno fmt --check`
  - `deno lint`
  - `deno check router/router.ts tpls/browser.ts src/app.ts src/router.ts src/tpls.ts`
  - `deno task test`（Q-01 完成后）
  - 任一步失败阻止发布。
- 注意：当前基线有 21 + 3 个类型错误（见 P-03、D-01），需先修复再开启 `deno check` 门槛，
  或先只对已通过的入口做增量检查。
- 验收标准：
  - [ ] PR 能看到 CI 结果。
  - [ ] 发布工作流依赖 CI 成功（`needs`）。

## Q-03 仓库清理（构建产物 / 二进制）【P2】

- 状态：🟡 部分完成（publish.exe 未被跟踪，忽略规则已确认；构建产物提交策略待定）
- 问题：
  - `publish.exe`（约 16MB）已被 git 跟踪；`.gitignore` 中的 `publish*` 对已跟踪文件无效。
  - `.cache/`（ts→js 缓存）目前未跟踪，但目录存在于工作区。
  - `assets/browser.js`、`assets/router.js` 为 `deno task pack` 产物，已提交；
    最新提交只重命名了 `pages_browser_0_0_26.js` 并同步了 `router.js`，说明产物与源码易失配。
  - `node_modules/`、`nodeModulesDir: "auto"` 与 Deno 的依赖管理方式需确认是否必要。
- 需求：
  - `git rm --cached publish.exe` 并确认 `.gitignore` 生效。
  - 明确产物策略：CI 构建并上传（当前 release.yml 已上传），还是提交产物。
    若继续提交产物，需在 README 注明"修改源码后必须重新 pack"。
  - 清理 `.cache/` 并确认忽略规则。
- 验收标准：
  - [ ] `git ls-files | rg "publish.exe|\\.cache"` 无输出。
  - [ ] 发布产物与源码版本可追溯（提交信息或校验文件）。

## Q-04 README 与变更日志【P2】

- 状态：✅ 已实现（README 重写 + CHANGELOG 0.0.27）
- 现状：README 仅有安装命令和目录一句话说明；无 API 文档、无示例、无 CHANGELOG。
- 需求：
  - 补充：
    - 快速开始（浏览器引入 `/router/router.ts` + `/tpls/browser.ts` 的顺序与全局变量）。
    - 路由 API：`on/off/search/navigate/replace/loading/init`、`Route` 字段、生命周期顺序。
    - `loadjs` 与（R-02 完成后）脚本清理的默认行为。
    - 模板 API 与语法表。
    - 开发/打包/发布命令：`deno task view`、`deno task pack`、`deno task release`。
  - 建立 `CHANGELOG.md`，遵循语义化版本；当前 `deno.json` 与 `dytes.json` 版本需先统一（P-04）。
  - 在 README 标注各模块的稳定性（实验/稳定）。
