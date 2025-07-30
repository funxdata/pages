import { Match, Route, RouteHooks, QContext, NavigateOptions, ResolveOptions,
   GenerateOptions, Handler, RouterOptions, CallBackFn } from "../types/router.ts";

import check_link from "./core/check_link.ts"
import check_url from "./core/check_url.ts";
import router from "./core/router_map.ts"
import RouteNode from "./core/route_node.ts";
import MatchRout from "./core/route_match.ts"

class PagesRouterInfo {
  routnode: RouteNode;
  routers: router[] = [];

  constructor() {
    this.watch_interface();
    this.routnode = new RouteNode("/");
  }

  watch_interface() {
    check_link(this);
  }

  on(path: string, hooks: CallBackFn): router {
    const rt = new router(path, hooks);
    this.routers.push(rt);
    return rt;
  }

  off(path: string): boolean {
    if (!this.routers) return false;
    for (let i = 0; i < this.routers.length; i++) {
      if (this.routers[i].path === path) {
        this.routers.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  navigate(redirt_url: string) {
    const info = check_url(redirt_url);
    this._match(info.pathname);
    this._pushState(redirt_url);
  }

  private async _match(path: string) {
    await MatchRout(path.trim(), this.routers);
  }

  private _pushState(redirt_url: string) {
    history.pushState(null, "", redirt_url);
  }
}

// deno-lint-ignore no-explicit-any
declare const globalThis:any;
// 👇 立即执行函数避免代码被打包器移除
(() => {
  globalThis.GlobalPagesRouter = new PagesRouterInfo();
  const url = globalThis.location.href;
  document.addEventListener("DOMContentLoaded", function () {
    globalThis.GlobalPagesRouter.navigate(url);
  });
})();
