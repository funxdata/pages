import type { Options } from "./types/config.ts";
import type { TemplateFunction } from "./types/compile.ts";
import type { AstObject } from "./types/parse.ts";

import { TplError } from "./err.ts";
import { defaultConfig } from "./config.ts";
import { compile } from "./compile.ts";
import { compileToString, compileBody } from "./compile-string.ts";
import { Cacher } from "./storage.ts";
import { parse } from "./parse.ts";
import { render, renderString, renderAsync, renderStringAsync } from "./render.ts";

export class Tpl {
  config = defaultConfig;
  templates = new Cacher();
  templatesSync = new Cacher();
  templatesAsync = new Cacher();
  filepathCache: Record<string, string> = {};
  TplErr = new TplError();

  resolvePath?: (this: Tpl, template: string, options?: Partial<Options>) => string;
  readFile?: (this: Tpl, path: string) => string;

  constructor(cfg: Partial<typeof defaultConfig> = {}) {
    this.config = { ...defaultConfig, ...cfg };
  }

  withConfig(customConfig: Partial<typeof defaultConfig>) {
    this.config = { ...this.config, ...customConfig };
  }

  // deno-lint-ignore no-explicit-any
  loadTemplate<T extends Record<string, any> = Record<string, any>>(
    name: string,
    template: string | TemplateFunction<T>,
    options?: { async: boolean }
  ) {
    const store = options?.async ? this.templatesAsync : this.templatesSync;
    if (typeof template === "string") {
      store.define(name, this.compile<T>(template, options));
    } else {
      store.define(name, template);
    }
  }

  // deno-lint-ignore no-explicit-any
  compile<T extends Record<string, any> = Record<string, any>>(
    template: string,
    options?: Partial<Options>
  ): TemplateFunction<T> {
    return compile<T>(this, template, options);
  }

  compileToString(template: string, options?: Partial<Options>) {
    return compileToString.call(this, template, options);
  }

  compileBody(buffer: AstObject[]) {
    return compileBody.call(this, buffer);
  }

  parse(template: string) {
    return parse.call(this, template);
  }

  /** 由 debug 模式生成的模板代码调用，统一抛出带上下文的运行时错误 */
  RuntimeErr(
    originalError: Error,
    templateStr: string,
    lineNo: number,
    filepath?: string
  ): never {
    return TplError.RuntimeError(originalError, templateStr, lineNo, filepath);
  }

  // deno-lint-ignore no-explicit-any
  render<T extends Record<string, any> = Record<string, any>>(
    template: string | TemplateFunction<T>,
    data?: T,
    meta?: object
  ) {
    return render.call(
      this,
      template as unknown as string | TemplateFunction,
      data as Record<string, any>,
      meta
    );
  }

  // deno-lint-ignore no-explicit-any
  renderAsync<T extends Record<string, any> = Record<string, any>>(
    template: string | TemplateFunction<T>,
    data?: T,
    meta?: object
  ) {
    return renderAsync.call(
      this,
      template as unknown as string | TemplateFunction,
      data as Record<string, any>,
      meta
    );
  }

  // deno-lint-ignore no-explicit-any
  renderString<T extends Record<string, any> = Record<string, any>>(
    template: string,
    data?: T
  ) {
    return renderString.call(this, template, data);
  }

  // deno-lint-ignore no-explicit-any
  renderStringAsync<T extends Record<string, any> = Record<string, any>>(
    template: string,
    data?: T
  ) {
    return renderStringAsync.call(this, template, data);
  }
}
