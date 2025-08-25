import type { TplConfig, Options } from "./config.ts";
import type { Cacher } from "./storage.ts";
import type { TemplateFunction } from "./compile.ts";
import type { TplError } from "./err.ts";
import type { AstObject } from "./parse.ts";

// 完整的 Tpl 类型定义，只做类型提示
export type Tpl = {
  config: TplConfig;
  filepathCache: Record<string, string>;
  templates: Cacher;
  templatesSync: Cacher;
  templatesAsync: Cacher;
  TplErr: TplError;

  resolvePath?: (this: Tpl, template: string, options?: Partial<Options>) => string;
  readFile?: (this: Tpl, path: string) => string;

  compile: <T extends Record<string, any> = Record<string, any>>(
    template: string,
    options?: Partial<Options>
  ) => TemplateFunction<T>;

  compileToString: (template: string, options?: Partial<Options>) => string;
  compileBody: (buffer: AstObject[]) => string;
  parse: (template: string) => AstObject[];

  render: <T extends Record<string, any> = Record<string, any>>(
    template: string | TemplateFunction<T>,
    data?: T,
    meta?: Partial<Options>
  ) => string;

  renderAsync: <T extends Record<string, any> = Record<string, any>>(
    template: string | TemplateFunction<T>,
    data?: T,
    meta?: Partial<Options>
  ) => Promise<string>;

  renderString: <T extends Record<string, any> = Record<string, any>>(
    template: string,
    data?: T
  ) => string;

  renderStringAsync: <T extends Record<string, any> = Record<string, any>>(
    template: string,
    data?: T
  ) => Promise<string>;

  withConfig: (customConfig: Partial<TplConfig>) => void;
  loadTemplate: (
    name: string,
    template: string | TemplateFunction,
    options?: { async: boolean }
  ) => void;
};
