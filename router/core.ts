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

  // 分页加载状态
  private isLoadingPagination = false;

  constructor() {
    const root = new RouteNode("/", []);
    this.nodes = root;

    const router: Route = new Route("/");
    this.routers = [router];
    this.routerMap = new Map([[router.pathname, router]]);

    this.is_load = true;
  }

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

  async navigate(redirt_url: string): Promise<void> {
    const check_pg = is_only_Pagination(redirt_url);
    const to_url = this.safeURL(redirt_url);
    if (!to_url) return this.loading_404();

    const rt = this.search(to_url.pathname);
    if (!rt) return this.loading_404();

    rt.is_history == 1 ? this._pushState(redirt_url) : this._replaceState(redirt_url);

    if (check_pg && !this.is_load) {
      await this.only_load_pagination(rt);
    } else {
      await this._match_loading(rt, to_url, check_pg);
    }
  }

  async replace(redirt_url: string): Promise<void> {
    const check_pg = is_only_Pagination(redirt_url);
    const to_url = this.safeURL(redirt_url);
    if (!to_url) return this.loading_404();

    this._replaceState(redirt_url);
    const rt = this.search(to_url.pathname);
    if (!rt) return this.loading_404();

    if (check_pg && !this.is_load) {
      await this.only_load_pagination(rt);
    } else {
      await this._match_loading(rt, to_url, check_pg);
    }
  }

  async loading(redirt_url: string): Promise<void> {
    const check_pg = is_only_Pagination(redirt_url);
    const to_url = this.safeURL(redirt_url);
    if (!to_url) return this.loading_404();

    const rt = this.search(to_url.pathname);
    if (!rt) return this.loading_404();

    if (check_pg) {
      await this.only_load_pagination(rt);
    } else {
      await this._match_loading(rt, to_url, false);
    }
  }

  search(path: string): Route | null {
    return this.routerMap.get(path) ?? null;
  }

  init(path: string) {
    const target = path || globalThis.location.href;
    this.navigate(target);
    this.is_load = false;
  }

  private _pushState(redirt_url: string) {
    history.pushState({ sys: true }, "", redirt_url);
  }

  private _replaceState(redirt_url: string) {
    history.replaceState({ sys: true }, "", redirt_url);
  }

  private async _match_loading(rt: Route, cur_url: URL, skipPagination = false) {
    if (rt.pathname !== cur_url.pathname) {
      cur_url.pathname = rt.pathname;
      if (cur_url.toString() !== location.href) {
        this.replace(cur_url.toString());
        return;
      }
    }

    try {
      await rt.do_load();
      if (!skipPagination && cur_url.search) {
        await this.safe_load_Pagination(rt);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("加载出错:", err.message);
      } else {
        console.error("未知错误:", err);
      }
    }
  }

  private async only_load_pagination(rt: Route) {
    await this.safe_load_Pagination(rt);
  }

  /** 安全调用分页，防止重复执行 */
  private async safe_load_Pagination(rt: Route) {
    if (this.isLoadingPagination) return;
    this.isLoadingPagination = true;

    try {
      await rt.load_Pagination();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("分页加载出错:", err.message);
      } else {
        console.error("未知分页加载错误:", err);
      }
    } finally {
      this.isLoadingPagination = false;
    }
  }

  private loading_404 = () => console.warn("route not found");

  private safeURL(url: string): URL | null {
    try {
      if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) return new URL(url, globalThis.location.origin);
      return new URL(url);
    } catch (e) {
      console.warn("Invalid URL:", url, e);
      return null;
    }
  }
}
