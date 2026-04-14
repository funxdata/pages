import type { PagesRouterInfo, HistoryStateArgs } from "@/types/router.ts";

// 定义一个全局定时器
let pushStateTimer: number | undefined;

/**
 * 防抖版 PushState 监听
 */
export const WatchPushState = (router: PagesRouterInfo, evt: HistoryStateArgs) => {
  if (evt[0] != null && evt[0].sys) {
    return;
  }

  const href = evt[2] as string;

  // 清除上一次定时器
  if (pushStateTimer) {
    clearTimeout(pushStateTimer);
  }

  // 设置新的定时器（防抖：200ms 内只触发最后一次）
  pushStateTimer = globalThis.window.setTimeout(() => {
    router.replace(href);
  }, 200);
};