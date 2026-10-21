import type {
  PagesRouterConfig,
  PagesRouterInfo,
  PagesRouterOptions,
  Route as RouteType,
} from "@/types/router.ts";
import { RouteNode } from "./core/route_node.ts";
import { Route } from "./core/router_map.ts";
import { MatchRoute } from "./core/match.ts";
import { isDynamicPath, matchPattern } from "./core/pattern.ts";
import { is_only_Pagination, safeURL } from "./core/check_url.ts";

type KeepAliveEntry = {
  html: string;
  scrollY: number;
};

export class PagesRouter implements PagesRouterInfo {
  nodes: RouteNode;
  routers: Route[];
  currentRoute: RouteType | null = null;
  config: PagesRouterConfig;
  private routerMap: Map<string, Route>;
  private is_load: boolean;

  // 分页加载状态
  private isLoadingPagination = false;
  private paginationPending = false;

  // keep-alive 与滚动位置
  private keepAliveCache = new Map<string, KeepAliveEntry>();
  private scrollPositions = new Map<string, number>();

  constructor(options: PagesRouterOptions = {}) {
    this.config = {
      removeLoadedScripts: options.removeLoadedScripts ?? true,
      scriptTimeout: options.scriptTimeout ?? 10_000,
      cacheBust: options.cacheBust ?? true,
      keepAlive: options.keepAlive ?? false,
      restoreScroll: options.restoreScroll ?? false,
      clearSearchOnLeave: options.clearSearchOnLeave ?? false,
      container: options.container,
      onNotFound: options.onNotFound,
      onError: options.onError,
    };

    const root = new RouteNode("/", []);
    this.nodes = root;

    const router: Route = new Route("/", this.route_options());
    this.routers = [router];
    this.routerMap = new Map([[router.pathname, router]]);

    this.is_load = true;
  }

  on(path: string, title: string): Route | null {
    if (this.routerMap.has(path)) {
      console.warn("Route path already exists:", path);
      return null;
    }
    const rt = new Route(path, this.route_options());
    rt.title = title;
    this.routers.push(rt);
    this.routerMap.set(path, rt);
    this.nodes.add_node(path, title);
    return rt;
  }

  off(path: string): boolean {
    const idx = this.routers.findIndex((r) => r.pathname === path);
    if (idx >= 0) {
      const [removed] = this.routers.splice(idx, 1);
      this.routerMap.delete(path);
      this.nodes.delete_node(path);
      if (this.currentRoute === removed) {
        this.currentRoute = null;
        void this.leave_route(removed);
      }
      return true;
    }
    return false;
  }

  async navigate(redirt_url: string): Promise<void> {
    const check_pg = is_only_Pagination(redirt_url);
    const to_url = safeURL(redirt_url);
    if (!to_url) return this.not_found(redirt_url);

    // 先用 MatchRoute 匹配路由（动态路由会在 search 中写入 params）
    const rt = MatchRoute(this, to_url);
    if (!rt) return this.not_found(redirt_url);

    // 根据匹配结果决定 push/replace
    this.clear_current_search();
    rt.is_history === 1
      ? this._pushState(redirt_url)
      : this._replaceState(redirt_url);

    // 分页或普通加载
    if (check_pg && !this.is_load) {
      await this.only_load_pagination(rt);
    } else {
      await this._match_loading(rt, to_url, check_pg);
    }
  }

  async replace(redirt_url: string): Promise<void> {
    const check_pg = is_only_Pagination(redirt_url);
    const to_url = safeURL(redirt_url);
    if (!to_url) return this.not_found(redirt_url);

    this.clear_current_search();
    this._replaceState(redirt_url);
    const rt = this.search(to_url.pathname);
    if (!rt) return this.not_found(redirt_url);

    if (check_pg && !this.is_load) {
      await this.only_load_pagination(rt);
    } else {
      await this._match_loading(rt, to_url, check_pg);
    }
  }

  async loading(redirt_url: string): Promise<void> {
    const check_pg = is_only_Pagination(redirt_url);
    const to_url = safeURL(redirt_url);
    if (!to_url) return this.not_found(redirt_url);

    const rt = this.search(to_url.pathname);
    if (!rt) return this.not_found(redirt_url);

    if (check_pg) {
      await this.only_load_pagination(rt);
    } else {
      await this._match_loading(rt, to_url, false);
    }
  }

  search(path: string): Route | null {
    const exact = this.routerMap.get(path);
    if (exact) {
      exact.params = {};
      return exact;
    }

    // 动态路由按注册顺序匹配；精确路由始终优先
    for (const route of this.routers) {
      if (!isDynamicPath(route.pathname)) continue;
      const matched = matchPattern(route.pathname, path);
      if (matched) {
        route.params = matched.params;
        return route;
      }
    }

    return null;
  }

  init(path?: string): void {
    const target = path || globalThis.location.href;
    void this.navigate(target).catch((err) => this.report_error(err));
    this.is_load = false;
  }

  /** 清理 keep-alive 缓存：不传参数时清空全部 */
  clearKeepAlive(path?: string): void {
    if (path === undefined) {
      this.keepAliveCache.clear();
      this.scrollPositions.clear();
      return;
    }
    this.keepAliveCache.delete(path);
    this.scrollPositions.delete(path);
  }

  private route_options() {
    return {
      cacheBust: this.config.cacheBust,
      scriptTimeout: this.config.scriptTimeout,
    };
  }

  private _pushState(redirt_url: string) {
    history.pushState({ sys: true }, "", redirt_url);
  }

  private _replaceState(redirt_url: string) {
    history.replaceState({ sys: true }, "", redirt_url);
  }

  private async _match_loading(
    rt: RouteType,
    cur_url: URL,
    skipPagination = false,
  ) {
    // 一级目录命中默认子路由时，先重定向到真实路径
    if (rt.pathname !== cur_url.pathname) {
      cur_url.pathname = rt.pathname;
      if (cur_url.toString() !== globalThis.location.href) {
        await this.replace(cur_url.toString());
        return;
      }
    }

    const restored = await this.switch_route(rt);

    if (!restored) {
      try {
        await rt.do_load();
      } catch (err) {
        this.report_error(err);
      }
    }

    if (!skipPagination && cur_url.search) {
      await this.safe_load_Pagination(rt);
    }
  }

  /**
   * 切换当前路由：先卸载旧路由（leave + 缓存 + 脚本清理），再记录新路由。
   * 返回 true 表示命中了 keep-alive 缓存（调用方应跳过 do_load）。
   */
  private async switch_route(rt: RouteType): Promise<boolean> {
    if (this.currentRoute === rt) return false;
    const previous = this.currentRoute;
    this.currentRoute = rt;
    if (previous) await this.leave_route(previous);
    return this.restore_route(rt);
  }

  private async leave_route(route: RouteType): Promise<void> {
    try {
      if (route.leave) await route.leave();
    } catch (err) {
      this.report_error(err);
    }

    const container = this.container();
    const keepAlive = this.shouldKeepAlive(route) && container !== null;
    const scrollY = current_scroll_y();

    if (container) {
      if (keepAlive) {
        // 保存 DOM 快照与滚动位置
        this.keepAliveCache.set(route.pathname, {
          html: container.innerHTML,
          scrollY,
        });
      } else if (this.config.restoreScroll) {
        this.scrollPositions.set(route.pathname, scrollY);
      }
    }

    // keep-alive 页面保留脚本，避免返回时重新执行页面初始化
    route.do_unload(
      this.config.removeLoadedScripts && !route.keepLoadedScript && !keepAlive,
    );
  }

  /** 返回 true 表示已恢复 DOM 缓存，调用方无需重新加载页面 */
  private restore_route(route: RouteType): boolean {
    const cached = this.keepAliveCache.get(route.pathname);
    const container = this.container();

    if (cached && container) {
      container.innerHTML = cached.html;
      scroll_to(cached.scrollY);
      return true;
    }

    if (this.config.restoreScroll) {
      scroll_to(this.scrollPositions.get(route.pathname) ?? 0);
    }
    return false;
  }

  private shouldKeepAlive(route: RouteType): boolean {
    return route.keepAlive === true ||
      (this.config.keepAlive && route.keepAlive !== false);
  }

  private container(): HTMLElement | null {
    const { container } = this.config;
    if (!container) return null;
    if (typeof container === "string") {
      if (typeof document === "undefined") return null;
      return document.querySelector(container) as HTMLElement | null;
    }
    return container;
  }

  /** R-05：离开带查询参数的页面时，先清理当前历史项的查询串 */
  private clear_current_search(): void {
    if (!this.config.clearSearchOnLeave) return;
    if (typeof globalThis.location === "undefined") return;
    if (typeof globalThis.history === "undefined") return;

    const url = new URL(globalThis.location.href);
    if (!url.search) return;
    url.search = "";
    history.replaceState({ sys: true }, "", url.href);
  }

  private async only_load_pagination(rt: RouteType) {
    await this.safe_load_Pagination(rt);
  }

  /**
   * 安全调用分页：
   * - 加载中再次触发时记录 pending，当前加载完成后补执行一次（以最后一次为准）
   * - 异常不会打断后续导航
   */
  private async safe_load_Pagination(rt: RouteType) {
    if (this.isLoadingPagination) {
      this.paginationPending = true;
      return;
    }
    this.isLoadingPagination = true;

    try {
      do {
        this.paginationPending = false;
        await rt.load_Pagination();
      } while (this.paginationPending);
    } catch (err) {
      this.report_error(err);
    } finally {
      this.isLoadingPagination = false;
    }
  }

  private not_found(redirt_url: string) {
    if (this.config.onNotFound) {
      try {
        this.config.onNotFound(redirt_url);
        return;
      } catch (err) {
        this.report_error(err);
        return;
      }
    }
    console.warn("route not found:", redirt_url);
  }

  private report_error(error: unknown) {
    if (this.config.onError) {
      try {
        this.config.onError(error);
        return;
      } catch (err) {
        error = err;
      }
    }
    if (error instanceof Error) {
      console.error("路由加载出错:", error.message, error);
    } else {
      console.error("路由加载出错:", error);
    }
  }
}

function current_scroll_y(): number {
  return typeof globalThis.scrollY === "number" ? globalThis.scrollY : 0;
}

function scroll_to(y: number): void {
  if (typeof globalThis.scrollTo === "function") {
    globalThis.scrollTo(0, y);
  }
}
