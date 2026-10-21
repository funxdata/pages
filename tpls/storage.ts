import type { Cacher as CacherType, CacheObj } from "./types/storage.ts";

export class Cacher implements CacherType {
  cache: CacheObj;
  constructor() {
    this.cache = {};
  }
  // deno-lint-ignore no-explicit-any
  define(key: string, val: any) {
    this.cache[key] = val;
  }
  // deno-lint-ignore no-explicit-any
  get(key: string): any {
    return this.cache[key];
  }
  has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.cache, key);
  }
  keys(): string[] {
    return Object.keys(this.cache);
  }
  remove(key: string) {
    delete this.cache[key];
  }
  clear() {
    this.cache = {};
  }
  reset() {
    this.cache = {};
  }
  size(): number {
    return Object.keys(this.cache).length;
  }
  load(cacheObj: CacheObj) {
    this.cache = { ...this.cache, ...cacheObj };
  }
}
