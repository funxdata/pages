import { Cacher } from "./storage.ts";
import { compile } from "./compile.ts";
import { compileBody, compileToString } from "./compile-string.ts";
import { defaultConfig } from "./config.ts";
import { parse } from "./parse.ts";
import {
  render,
  renderAsync,
  renderString,
  renderStringAsync,
} from "./render.ts";
import { TplError, RuntimeErr } from "./err.ts";
import { TemplateFunction } from "./compile.ts";
import * as path from "@std/path"

/* TYPES */
import type { TplConfig, Options } from "./config.ts";
/* END TYPES */

export class Tpl {

  constructor(customConfig: Partial<TplConfig>) {
    if (customConfig) {
      this.config = { ...defaultConfig, ...customConfig };
    } else {
      this.config = { ...defaultConfig };
    }
  }


  config: TplConfig;

  RuntimeErr = RuntimeErr;

  compile = compile;
  compileToString = compileToString;
  compileBody = compileBody;
  parse = parse;
  render = render;
  renderAsync = renderAsync;
  renderString = renderString;
  renderStringAsync = renderStringAsync;

  filepathCache: Record<string, string> = {};
  templatesSync: Cacher<TemplateFunction> = new Cacher<TemplateFunction>({});
  templatesAsync: Cacher<TemplateFunction> = new Cacher<TemplateFunction>({});

  // resolvePath takes a relative path from the "views" directory
  resolvePath:
    | null
    | ((this: Tpl, template: string, options?: Partial<Options>) => string) =
      null;
  readFile: null | ((this: Tpl, path: string) => string) = null;

  // METHODS

  configure(customConfig: Partial<TplConfig>) {
    this.config = { ...this.config, ...customConfig };
  }

  withConfig(customConfig: Partial<TplConfig>): this & { config: TplConfig } {
    return { ...this, config: { ...this.config, ...customConfig } };
  }

  loadTemplate(
    name: string,
    template: string | TemplateFunction, // template string or template function
    options?: { async: boolean },
  ): void {
    if (typeof template === "string") {
      const templates = options && options.async
        ? this.templatesAsync
        : this.templatesSync;

      templates.define(name, this.compile(template, options));
    } else {
      let templates = this.templatesSync;

      if (
        template.constructor.name === "AsyncFunction" ||
        (options && options.async)
      ) {
        templates = this.templatesAsync;
      }

      templates.define(name, template);
    }
  }
}

// for instance checking against thrown errors
export { TplError };