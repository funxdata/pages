import type { InternalOptions } from "./types/config.ts";
import type { TemplateFunction } from "./types/compile.ts";
import type { Tpl } from "./types/core.ts";

function handleCache(
  this: Tpl,
  template: string,
  options: InternalOptions,
): TemplateFunction {
  const store = options.async ? this.templatesAsync : this.templatesSync;

  // 只有显式配置了 views 且实现了文件读取时才走文件模板分支；
  // 浏览器端 / 纯字符串模板直接从已注册模板中查找。
  if (
    this.config.views &&
    this.resolvePath &&
    this.readFile &&
    !template.startsWith("@")
  ) {
    const filepath = this.resolvePath(template, options);
    options.filepath = filepath;

    const cached = store?.get(filepath);
    if (this.config.cache && cached) return cached;

    const tplStr = this.readFile(filepath);
    const tplFn = this.compile(tplStr, options);
    if (this.config.cache) store?.define(filepath, tplFn);
    return tplFn;
  }

  const cached = store?.get(template);
  if (cached) return cached;

  this.TplErr.TplNameResolutionError(
    `Failed to get template '${template}'` +
      (this.config.views ? ` (views: ${this.config.views})` : ""),
  );
  // 上面的调用总会抛错；显式 return 让类型检查器确认所有分支都有返回值
  return this.TplErr.TplNameResolutionError(
    `Failed to get template '${template}'`,
  );
}

// deno-lint-ignore no-explicit-any
export function render<T extends Record<string, any> = Record<string, any>>(
  this: Tpl,
  template: string | TemplateFunction<T>,
  data: T = {} as T,
  meta?: InternalOptions,
): string {
  const options: InternalOptions = { ...meta, async: false };
  const tplFn = (
    typeof template === "string"
      ? handleCache.call(this, template, options)
      : template
  ) as TemplateFunction<T>;

  return tplFn.call(this, data, options);
}

// deno-lint-ignore no-explicit-any
export function renderAsync<T extends Record<string, any> = Record<string, any>>(
  this: Tpl,
  template: string | TemplateFunction<T>,
  data: T = {} as T,
  meta?: InternalOptions,
): Promise<string> {
  const options: InternalOptions = { ...meta, async: true };
  const tplFn = (
    typeof template === "string"
      ? handleCache.call(this, template, options)
      : template
  ) as TemplateFunction<T>;

  return Promise.resolve(tplFn.call(this, data, options));
}

// deno-lint-ignore no-explicit-any
export function renderString<T extends Record<string, any> = Record<string, any>>(
  this: Tpl,
  template: string,
  data: T = {} as T,
): string {
  const tplFn = this.compile<T>(template, { async: false });
  return tplFn.call(this, data, { async: false });
}

// deno-lint-ignore no-explicit-any
export function renderStringAsync<
  T extends Record<string, any> = Record<string, any>,
>(
  this: Tpl,
  template: string,
  data: T = {} as T,
): Promise<string> {
  const tplFn = this.compile<T>(template, { async: true });
  return Promise.resolve(tplFn.call(this, data, { async: true }));
}
