import type { Tpl } from "./core.ts";
import type { Options } from "./config.ts";

// 模板函数：通过 fn.call(tpl, data, options) 调用
// deno-lint-ignore no-explicit-any
export type TemplateFunction<T extends Record<string, any> = Record<string, any>> = (
  this: Tpl,
  data?: T,
  options?: Partial<Options>
) => string;

// compile 类型泛型化
// deno-lint-ignore no-explicit-any
export type compile = <T extends Record<string, any> = Record<string, any>>(
  tpl: Tpl,
  str: string,
  options?: Partial<Options>
) => TemplateFunction<T>;
