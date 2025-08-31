//  监听页面的替换变化
// replaceState 主要针对于页面只改变地址,不记录历史记录地址
import type { PagesRouterInfo, HistoryStateArgs } from "@/types/router.ts";

// 定义一个全局定时器
let replaceStateTimer: number | undefined;

/**
 * 防抖版 replaceState 监听
 */
export const WatchReplace = (router: PagesRouterInfo, evt: HistoryStateArgs) => {
  if (evt[0] != null && evt[0].sys) {
    return;
  }

  const href = evt[2] as string;

  // 清除上一次定时器
  if (replaceStateTimer) {
    clearTimeout(replaceStateTimer);
  }

  // 设置新的定时器（防抖：200ms 内只触发最后一次）
  replaceStateTimer = globalThis.window.setTimeout(() => {
    router.loading(href);
  }, 200);
};