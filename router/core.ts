import type { PagesRouterInfo, RouteMap } from "@/types/router.ts";
import { RouteNode } from "./core/route_node.ts";
import { Route } from "./core/router_map.ts";
import { MatchRoute } from "./core/match.ts";
import { is_only_Pagination } from "./core/check_url.ts";

export class PagesRouter implements PagesRouterInfo {
  nodes: RouteNode;
  routers: RouteMap;
  private routerMap: Map<string, Route>;
  private is_load: boolean;

  constructor() {
    const root = new RouteNode("/", []);
    this.nodes = root;

    const router: Route = new Route("/");
    this.routers = [router];
    this.routerMap = new Map([[router.pathname, router]]);

    this.is_load = true;
  }

  /** 绑定路由 */
  on(path: string, title: string): Route | null {
    if (this.search(path) != null) {
      console.warn("Route path already exists:", path);
      return null;
    }
    const rt = new Route(path);
    this.routers.push(rt);
    this.routerMap.set(path, rt);
    this.nodes.add_node(path, title);
    return rt;
  }

  /** 删除路由 */
  off(path: string): boolean {
    const idx = this.routers.findIndex(r => r.pathname === path);
    if (idx >= 0) {
      this.routers.splice(idx, 1);
      this.routerMap.delete(path);
      this.nodes.delete_node(path);
      return true;
    }
    return false;
  }

  /** 跳转，需要记录到路由表中 */
  async navigate(redirt_url: string): Promise<void> {
    const check_pg = is_only_Pagination(redirt_url);
    const to_url = this.safeURL(redirt_url);
    if (!to_url) {
      this.loading_404();
      return;
    }

    const rt = this.search(to_url.pathname);
    if (!rt) {
      this.loading_404();
      return;
    }

    if (rt.is_history == 1) {
      this._pushState(redirt_url);
    } else {
      this._replaceState(redirt_url);
    }

    if (check_pg && !this.is_load) {
      await this.only_load_pagination(redirt_url);
    } else {
      await this._match_loading(redirt_url);
    }
  }

  /** 替换，不需要记录到路由表中 */
  async replace(redirt_url: string): Promise<void> {
    const check_pg = is_only_Pagination(redirt_url);
    this._replaceState(redirt_url);
    if (check_pg) {
      await this.only_load_pagination(redirt_url);
    } else {
      await this._match_loading(redirt_url);
    }
  }

  /** 仅加载数据 */
  async loading(redirt_url: string): Promise<void> {
    const check_pg = is_only_Pagination(redirt_url);
    if (check_pg) {
      await this.only_load_pagination(redirt_url);
    } else {
      await this._match_loading(redirt_url);
    }
  }

  /** 查找路由 */
  search(path: string): Route | null {
    return this.routerMap.get(path) ?? null;
  }

  /** 初始化 */
  init(path: string) {
    const target = path == null || path === "" ? globalThis.location.href : path;
    this.navigate(target);
    this.is_load = false;
  }

  /** pushState 封装 */
  private _pushState(redirt_url: string) {
    history.pushState({ sys: true }, "", redirt_url);
  }

  /** replaceState 封装 */
  private _replaceState(redirt_url: string) {
    history.replaceState({ sys: true }, "", redirt_url);
  }

  /** 路由匹配并加载 */
  private async _match_loading(redirt_url: string) {
    const cur_url = this.safeURL(redirt_url);
    if (!cur_url) {
      this.loading_404();
      return;
    }
    const rt = MatchRoute(this, cur_url);
    if (!rt) {
      this.loading_404();
      return;
    }
    if (rt.pathname !== cur_url.pathname) {
      cur_url.pathname = rt.pathname;
      this.replace(cur_url.toString());
    }
    await rt.do_load();
    if (cur_url.search) {
      await rt.load_Pagination();
    }
  }

  /** 仅加载分页数据 */
  private async only_load_pagination(to_url: string) {
    const cur_url = this.safeURL(to_url);
    if (!cur_url) {
      this.loading_404();
      return;
    }
    const rt = MatchRoute(this, cur_url);
    if (!rt) {
      this.loading_404();
      return;
    }
    await rt.load_Pagination();
  }

  /** 404 回调 */
  private loading_404 = () => {
    console.warn("route not found");
  };

  /** 安全 URL 解析，支持相对路径 */
  private safeURL(url: string): URL | null {
    try {
      if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
        return new URL(url, globalThis.location.origin);
      }
      return new URL(url);
    } catch (e) {
      console.warn("Invalid URL:", url, e);
      return null;
    }
  }
}
