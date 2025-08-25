import type { InternalOptions } from "./types/config.ts";
import type { TemplateFunction } from "./types/compile.ts";
import type { Tpl } from "./types/core.ts";

function handleCache<T>(
  this: Tpl,
  template: string,
  options: InternalOptions,
): TemplateFunction<T> {
  const store = options.async ? this.templatesAsync : this.templatesSync;

  if (this.resolvePath && this.readFile && !template.startsWith("@")) {
    const filepath = this.resolvePath(template, options);
    options.filepath = filepath;

    const cached = store?.get(filepath);
    if (this.config.cache && cached) return cached;

    const tplStr = this.readFile(filepath);
    const tplFn = this.compile<T>(tplStr, options);
    if (this.config.cache) store?.define(filepath, tplFn);
    return tplFn;
  }

  const cached = store?.get(template);
  if (cached) return cached;

  this.TplErr.TplNameResolutionError(`Failed to get template '${template}'`);
  throw new Error(`Template not found: ${template}`);
}

export function render<T = Record<string, any>>(
  this: Tpl,
  template: string | TemplateFunction<T>,
  data: T = {} as T,
  meta?: InternalOptions,
): string {
  const options: InternalOptions = { ...meta, async: false };
  const tplFn = typeof template === "string"
    ? handleCache.call(this, template, options)
    : template;

  return tplFn.call(this, data, options); // TS 不再报错
}

export function renderAsync<T = Record<string, any>>(
  this: Tpl,
  template: string | TemplateFunction<T>,
  data: T = {} as T,
  meta?: InternalOptions,
): Promise<string> {
  const options: InternalOptions = { ...meta, async: true };
  const tplFn = typeof template === "string"
    ? handleCache.call(this, template, options)
    : template;

  return Promise.resolve(tplFn.call(this, data, options));
}

export function renderString<T = Record<string, any>>(
  this: Tpl,
  template: string,
  data: T = {} as T,
): string {
  const tplFn = this.compile<T>(template, { async: false });
  return tplFn.call(this, data, { async: false });
}

export function renderStringAsync<T = Record<string, any>>(
  this: Tpl,
  template: string,
  data: T = {} as T,
): Promise<string> {
  const tplFn = this.compile<T>(template, { async: true });
  return Promise.resolve(tplFn.call(this, data, { async: true }));
}