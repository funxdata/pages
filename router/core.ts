import type { PagesRouterInfo,RouteMap } from "@/types/router.ts";
import { RouteNode } from "./core/route_node.ts";
import { Route } from "./core/router_map.ts"
import { MatchRoute } from "./core/match.ts"
export class PagesRouter implements PagesRouterInfo {
  nodes: RouteNode;
  routers: RouteMap;
  constructor() {
    const root = new RouteNode("/",[]);
    this.nodes = root;
    const router:Route = new Route("/");
    this.routers = [router];
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
  // 需要记录到路由表中
  async navigate(redirt_url: string): Promise<void> {
    const to_url = new URL(redirt_url)
    const rt = this.search(to_url.pathname);
    if(rt == null||rt==undefined){
      this.loading_404()
      return;
    }
    if(rt.is_history==1){
      this._pushState(redirt_url);
    }else{
      this._replaceState(redirt_url);
    }
    await this.loading(redirt_url);
  }

  // 替换
  // 不需要记录到路由表中
  async replace(redirt_url:string): Promise<void> {
    this._replaceState(redirt_url);
    await this.loading(redirt_url);
  }

  async loading(redirt_url:string): Promise<void> {
    await this._match_loading(redirt_url);
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
  init(path:string) {
    if(path==""||path==null){
      const curPath = globalThis.location.href;
      this.navigate(curPath)
    }else{
      this.navigate(path)
    }
  }
  private _pushState(redirt_url: string) {
    history.pushState({sys:true}, "", redirt_url);
  }

  private _replaceState(redirt_url: string) {
    history.replaceState({sys:true}, "", redirt_url);
  }

  // 路由匹配
  private async _match_loading(redirt_url: string) {
    const cur_url = new URL(redirt_url);
    const rt = MatchRoute(this,cur_url);
    if(rt==null){
      this.loading_404();
      return;
    }
    if(rt.pathname!=cur_url.pathname){
      cur_url.pathname = rt.pathname;
      this.replace(cur_url.toString());
    }
    await rt.do_load();
    await rt.load_Pagination();
  }

  private loading_404= ()=>{
     console.warn("route not found");
  }
}

