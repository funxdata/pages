export type CacheObj = Record<string, any>;

// 泛型 T 表示缓存值的类型
export type Cacher<T = any>= {
  define(key: string, val: T): void;
  get(key: string): T | undefined;
  remove(key: string): void;
  reset(): void;
  load(cacheObj: CacheObj): void;
}