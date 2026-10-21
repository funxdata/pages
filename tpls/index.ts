import { Tpl as TplCore } from "./core.ts";
import { readFile, resolvePath } from "./file-handling.ts";

export { TplError } from "./err.ts";
export type { TplConfig, Options } from "./types/config.ts";

/**
 * 带文件系统能力的模板实现（Deno/Node 端）。
 * 浏览器端请使用 `tpls/browser.ts` 暴露的 `globalThis.TplToHtml`。
 */
export class Tpl extends TplCore {
  override readFile = readFile;
  override resolvePath = resolvePath;
}
