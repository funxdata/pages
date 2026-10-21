import type { PagesRouterInfo, HistoryStateArgs } from "@/types/router.ts";
import { PagesRouter } from "./core.ts";
import { WatchClickLink } from "./watch/watch_click.ts";
import { WatchPopState } from "./watch/watch_pop.ts";
import { WatchPushState } from "./watch/watch_push.ts";
import { WatchReplace } from "./watch/watch_replace.ts";

// 初始化并挂载到 globalThis
declare const globalThis: any;

export const GlobalPagesRouter = new PagesRouter();
globalThis.GlobalPagesRouter = GlobalPagesRouter;

export type Cleanup = () => void;

let cleanup: Cleanup | null = null;

/**
 * 安装全局监听（点击、pushState、replaceState、popstate）。
 * 重复调用返回同一个清理函数。
 */
export const install = (router: PagesRouterInfo = GlobalPagesRouter): Cleanup => {
  if (cleanup) return cleanup;

  const onClick = (event: MouseEvent) => WatchClickLink(router, event);
  const onPopState = (event: PopStateEvent) => WatchPopState(router, event);

  const rawPushState = history.pushState;
  const rawReplaceState = history.replaceState;

  const pushState = function (
    this: History,
    ...args: Parameters<History["pushState"]>
  ) {
    const result = rawPushState.apply(this, args);
    WatchPushState(router, args as unknown as HistoryStateArgs);
    return result;
  };

  const replaceState = function (
    this: History,
    ...args: Parameters<History["replaceState"]>
  ) {
    const result = rawReplaceState.apply(this, args);
    WatchReplace(router, args as unknown as HistoryStateArgs);
    return result;
  };

  history.pushState = pushState;
  history.replaceState = replaceState;
  globalThis.addEventListener("click", onClick);
  globalThis.addEventListener("popstate", onPopState);

  cleanup = () => {
    globalThis.removeEventListener("click", onClick);
    globalThis.removeEventListener("popstate", onPopState);
    history.pushState = rawPushState;
    history.replaceState = rawReplaceState;
  };

  return cleanup;
};

/** 卸载全局监听，便于嵌入宿主或测试 */
export const uninstall = (): void => {
  cleanup?.();
  cleanup = null;
};

install();
