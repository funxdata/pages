import type {
  CallBackFn,
  Route as RouteType,
  RouteLoadOptions,
} from "@/types/router.ts";
import { service_plugin } from "./service_plugin.ts";
import {
  canonicalUrl,
  getPathLevel,
  hasScript,
  withCacheBust,
} from "./utils.ts";

const DEFAULT_SCRIPT_TIMEOUT = 10_000;

export class Route implements RouteType {
  pathname: string;
  title?: string; // 节点名称
  loadjs?: string;
  keepLoadedScript = false;
  keepAlive?: boolean;
  params: Record<string, string> = {};
  loadedScripts: HTMLScriptElement[] = [];
  hook?: CallBackFn;
  already?: CallBackFn;
  before?: CallBackFn;
  after?: CallBackFn;
  leave?: CallBackFn;
  Pagination?: CallBackFn;
  onLoadError?: (error: Error) => void;
  is_history: number;

  private options: RouteLoadOptions;
  private loadingScript?: { url: string; promise: Promise<void> };

  constructor(pathname: string, options: RouteLoadOptions = {}) {
    this.pathname = pathname;
    this.options = options;
    this.is_history = 1;
  }

  async do_load(): Promise<void> {
    if (this.loadjs) {
      await this.do_load_script();
    } else {
      await this.do_load_fn();
    }
    // 二级目录加载
    if (getPathLevel(this.pathname) > 1) {
      service_plugin();
    }
  }

  async do_load_fn(): Promise<void> {
    if (this.already) await this.already();
    if (this.before) await this.before();
    if (this.hook) await this.hook();
    if (this.after) await this.after();
  }

  async do_load_script(): Promise<void> {
    const loadjs = this.loadjs;
    if (!loadjs) return;

    const canonical = canonicalUrl(loadjs);

    // 同一路由并发加载时复用同一个 Promise（含 hook）
    if (this.loadingScript && this.loadingScript.url === canonical) {
      await this.loadingScript.promise;
      return;
    }

    // 本路由加载的脚本仍在页面上 → 直接执行 hook
    if (
      this.loadedScripts.some((script) =>
        script.isConnected && canonicalUrl(script.src) === canonical
      )
    ) {
      await this.run_hook();
      return;
    }

    // 页面中已有同地址脚本（例如其他路由或宿主页面加载过）：
    // 不重复插入，也不接管其所有权，避免离开时误删。
    if (hasScript(canonical)) {
      await this.run_hook();
      return;
    }

    const promise = this.injectScript(loadjs, canonical).then(() => {
      // 加载期间路由已切走（脚本被清理）时，不再执行迟到的 hook
      if (!this.loadedScripts.some((script) => script.isConnected)) return;
      return this.run_hook();
    });

    this.loadingScript = { url: canonical, promise };
    try {
      await promise;
    } finally {
      if (this.loadingScript?.promise === promise) {
        this.loadingScript = undefined;
      }
    }
  }

  private injectScript(loadjs: string, canonical: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof document === "undefined") {
        reject(this.fail(`[router] document is not available: ${canonical}`));
        return;
      }

      const script = document.createElement("script");
      script.dataset.pagesRoute = this.pathname;
      script.src = this.options.cacheBust === false
        ? canonical
        : withCacheBust(loadjs);
      script.async = true;
      script.type = "module";

      const timeout = this.options.scriptTimeout ?? DEFAULT_SCRIPT_TIMEOUT;
      const timer = setTimeout(() => {
        cleanup();
        script.remove();
        reject(this.fail(`[router] script load timeout: ${canonical}`));
      }, timeout);

      const cleanup = () => {
        clearTimeout(timer);
        script.onload = null;
        script.onerror = null;
      };

      script.onload = () => {
        cleanup();
        resolve();
      };

      script.onerror = () => {
        cleanup();
        script.remove();
        reject(this.fail(`[router] failed to load script: ${canonical}`));
      };

      this.loadedScripts.push(script);
      document.body.appendChild(script);
    });
  }

  private fail(message: string): Error {
    const error = new Error(message);
    this.onLoadError?.(error);
    return error;
  }

  private async run_hook(): Promise<void> {
    if (this.hook) await this.hook();
  }

  /** 加载分页方法 */
  async load_Pagination(): Promise<void> {
    if (this.Pagination) await this.Pagination();
  }

  /**
   * 离开路由时清理本次加载的脚本。
   * 移除 <script> 不会撤销模块副作用，需要页面自行在 leave 中清理。
   */
  do_unload(removeScripts = true): void {
    if (removeScripts) {
      for (const script of this.loadedScripts) {
        script.remove();
      }
    }
    this.loadedScripts = [];
    this.loadingScript = undefined;
  }
}
