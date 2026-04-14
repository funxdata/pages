import type { TemplateFunction } from "./compile.ts";

export type CacheObj = { [key: string]: any };

export type Cacher<T = TemplateFunction> = {
  cache: CacheObj;
  define: (key: string, val: T) => void;
  get: (key: string) => T | undefined;
  remove: (key: string) => void;
  reset: () => void;
  load: (cacheObj: CacheObj) => void;
};