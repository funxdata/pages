import { Match, Route, RouteHooks, QContext, NavigateOptions, ResolveOptions,
   GenerateOptions, Handler, RouterOptions, CallBackFn } from "@/types/router.ts";
import check_link from "./core/check_link.ts";
import check_url from "./core/check_url.ts";
import Router from "./core/router_map.ts";
import RouteNode from "./core/route_node.ts";
import MatchRout from "./core/route_match.ts";

class PagesRouterInfo {
  routeNode: RouteNode;
  routers: Router[] = [];

  constructor() {
    this.routeNode = new RouteNode("/");
    this.watch_interface();
  }

  watch_interface() {
    if (typeof document !== "undefined") {
      check_link(this);
    }
  }

  on(path: string, hooks: CallBackFn): Router {
    const rt = new Router(path, hooks);
    this.routers.push(rt);
    return rt;
  }

  off(path: string): boolean {
    const index = this.routers.findIndex(r => r.path === path);
    if (index === -1) return false;
    this.routers.splice(index, 1);
    return true;
  }

  async navigate(redirt_url: string) {
    const info = check_url(redirt_url);
    await this._match(info.pathname);
    this._pushState(redirt_url);
  }

  private async _match(path: string) {
    await MatchRout(path.trim(), this.routers);
  }

  private _pushState(redirt_url: string) {
    if (typeof history !== "undefined" && typeof history.pushState === "function") {
      history.pushState(null, "", redirt_url);
    }
  }
}

const GlobalPagesRouter = new PagesRouterInfo();

if (typeof document !== "undefined" && typeof globalThis.location !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    GlobalPagesRouter.navigate(globalThis.location.href);
  });
}

export default PagesRouterInfo;
