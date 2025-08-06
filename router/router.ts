import type { PagesRouterInfo,RouteMap } from "@/types/router.ts";
import { RouteNode } from "./core/route_node.ts";
import { Route } from "./core/router_map.ts"
import { WatchClickLink } from "./core/watch_click.ts"
import { MatchRout } from "./core/match.ts"
// import { check_url } from "./core/check_url.ts"
import { WatchPopState } from "./core/watch_pop.ts"
import { WatchReplaceState } from "./core/watch_replace.ts"

class PagesRouter implements PagesRouterInfo {
  nodes: RouteNode;
  routers: RouteMap;

  constructor() {
    const root = new RouteNode("/",[]);
    this.nodes = root;
    const router:Route = new Route("/");
    this.routers = [router]  
    WatchClickLink(this); // 处理点击事件
    WatchPopState(this);  // url 跳转事件
    WatchReplaceState(this); // 替换事件
  }

  // 绑定路由
  on(path: string,title:string): Route|null {
    if(this.search(path)!=null){
      console.warn("Route path already exists")
      return null;
    }
    const rt = new Route(path);
    this.routers.push(rt);
    this.nodes.add_node(path,title);
    return rt;
  }
  // 删除路由
  off(path: string): boolean {
    // 删除 node
    for (let index = 0; index < this.routers.length; index++) {
      const element = this.routers[index] as Route;
      if(element.pathname == path){
        this.routers.splice(index,1)
        this.nodes.delete_node(path)
        return true
      }
    }
    return false;
  }
  // 跳转
  async navigate(path: string): Promise<void> {
    this._pushState(path);
    await this._match(path);
  }

  // 处理参数
  Pagination(rt:Route,params:string){
    const currentUrl = new URL(location.href);
    const param_url = currentUrl.pathname+params;
    this._pushState(param_url);
    // rt.load_Pagination();
  }
  search(path:string):Route|null{
    for (let index = 0; index < this.routers.length; index++) {
      const element = this.routers[index] as Route;
      if(element.pathname == path){
        return element
      }
    }
    return null;
  }
  
  // 初始化
  init() {
    const curPath = globalThis.location.pathname;
    this._match(curPath);
    this.routers[0].do_load();
  }
  private _pushState(redirt_url: string) {
    const currentUrl = new URL(location.href);
    const cur_url = currentUrl.pathname+currentUrl.search;
    if(cur_url==redirt_url){
      return;
    }
    console.log(redirt_url)
    history.pushState(null, "", redirt_url);
  }
  private async _match(path: string) {
    const curPath = globalThis.location.pathname;
    const from = this.search(curPath);
    const to = this.search(path);
    await MatchRout(this,from, to);
  }
}
// 初始化并挂载到globalThis
// deno-lint-ignore no-explicit-any
declare const globalThis:any
const GlobalPagesRouter = new PagesRouter();
globalThis.GlobalPagesRouter = GlobalPagesRouter;
// 打补丁：自动触发 locationchange 事件
export const patchHistoryEvents = () => {
  const rawPushState = history.pushState;
  const rawReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const result = rawPushState.apply(this, args);
    globalThis.dispatchEvent(new Event("locationchange"));
    return result;
  };

  history.replaceState = function (...args) {
    const result = rawReplaceState.apply(this, args);
    globalThis.dispatchEvent(new Event("locationreplaceState"));
    return result;
  };

  // 返回/前进操作也要触发 locationchange
  globalThis.addEventListener("popstate", () => {
    globalThis.dispatchEvent(new Event("locationchange"));
  });
};
patchHistoryEvents(); // 确保 patch 已应用
