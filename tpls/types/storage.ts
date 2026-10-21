import type { TemplateFunction } from "./compile.ts";

export type CacheObj = { [key: string]: any };

export type Cacher<T = TemplateFunction> = {
  cache: CacheObj;
  define: (key: string, val: T) => void;
  get: (key: string) => T | undefined;
  has: (key: string) => boolean;
  keys: () => string[];
  remove: (key: string) => void;
  clear: () => void;
  reset: () => void;
  size: () => number;
  load: (cacheObj: CacheObj) => void;
};
