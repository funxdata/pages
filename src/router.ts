import {Match,Route, RouteHooks, QContext, NavigateOptions, ResolveOptions,
   GenerateOptions, Handler, RouterOptions, CallBackFn } from "./types.ts";
import check_link from "./core/check_link.ts"
import check_url from "./core/check_url.ts";
import router from "./core/router_map.ts"
import RouteNode from "./core/route_node.ts";
import MatchRout from "./core/route_match.ts"
class PagesRouterInfo {
  routnode:RouteNode;
  routers:router[] =[]
  // 初始化路由表
  constructor(){
    // this.root = root;
    // 开启所有点击事件阻止
    this.watch_interface();
    this.routnode = new RouteNode("/");
  }
  watch_interface(){
   check_link(this)
  }
  // 绑定路由表
  on(path: string,hooks: CallBackFn):router{
    const rt = new router(path,hooks)
    this.routers.push(rt)
    return rt;
  }
  // 添加路由表
  private _on_routs(){

  }
  // 添加路由节点
  private _on_rout_node(){

  }
  // 删除路由表
  off(path: string):boolean{
    if (this.routers===undefined){
      return false;
    }
    for (let index = 0; index < this.routers.length; index++) {
      if(this.routers[index].path ==path){
        this.routers.splice(index,1)
        return true
      }
    } 
    return false;
  }
  // 删除路由表
  private _off_routs(){

  }
  // 删除路由节点
  private _off_rout_node(){

  }
  // 页面跳转
  navigate(redirt_url:string){
    // 网站第一次加载
    let info = check_url(redirt_url)
    this._match(info.pathname)
    this._pushState(redirt_url)
  }

  // 执行路由匹配
  private async _match(path:string){
    await MatchRout(path.trim(),this.routers)
  }
  // 更新网页
  private _pushState(redirt_url:string){
    history.pushState(null, "", redirt_url);
    // console.log("跳转至:",redirt_url)
  } 
}
const GlobalPagesRouter = new PagesRouterInfo()
const url = globalThis.location.href;
document.addEventListener("DOMContentLoaded", function(){
  GlobalPagesRouter.navigate(url)
});