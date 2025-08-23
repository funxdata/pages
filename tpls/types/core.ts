import type { TplConfig, Options } from "./types/config.ts";
import type { Cacher } from "./storage.ts";
import type { TemplateFunction } from "./compile.ts";
import type { TplError, RuntimeErr } from "./err.ts";

export type Tpl = {
  config: TplConfig;

  // 错误
  RuntimeErr: typeof RuntimeErr;

  // 编译相关
  compile: (template: string, options?: Partial<any>) => TemplateFunction;
  compileToString: (template: string, options?: Partial<any>) => string;
  compileBody: (buff: string) => string;
  parse: (template: string) => any;

  // 渲染相关
  render: (template: string | TemplateFunction, data?: object, meta?: object) => string;
  renderAsync: (template: string | TemplateFunction, data?: object, meta?: object) => Promise<string>;
  renderString: (template: string, data?: object) => string;
  renderStringAsync: (template: string, data?: object) => Promise<string>;

  // 缓存
  filepathCache: Record<string, string>;
  templatesSync: Cacher<TemplateFunction>;
  templatesAsync: Cacher<TemplateFunction>;

  // I/O 与路径
  resolvePath: null | ((this: Tpl, template: string, options?: Partial<Options>) => string);
  readFile: null | ((this: Tpl, path: string) => string);

  // 方法
  configure(customConfig: Partial<TplConfig>): void;
  withConfig(customConfig: Partial<TplConfig>): this & { config: TplConfig };
  loadTemplate(
    name: string,
    template: string | TemplateFunction,
    options?: { async: boolean },
  ): void;
};

// for instanceof 检查
export type { TplError };