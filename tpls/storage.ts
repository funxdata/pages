import type { Cacher as CacherType,CacheObj} from "./types/storage.ts"
export class Cacher implements CacherType {
  cache: CacheObj;
  constructor() {
    this.cache = {};
  }
  // deno-lint-ignore no-explicit-any
  define(key: string, val: any){
    this.cache[key] = val;
  }
  // deno-lint-ignore no-explicit-any
  get(key: string): any {
    return this.cache[key];
  }
  remove(key: string) {
    delete this.cache[key];
  }
  reset(){
    this.cache = {};
  }
  load(cacheObj: CacheObj) {
    this.cache = { ...this.cache, ...cacheObj };
  }
}