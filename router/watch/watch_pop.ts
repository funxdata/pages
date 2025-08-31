//  监听页面的替换变化
// PopState 菜单栏左右按键的切换
import type { PagesRouterInfo } from "@/types/router.ts";
// 定义一个全局定时器
let popStateTimer: number | undefined;
export const WatchPopState = (router: PagesRouterInfo,evt:PopStateEvent) => {
  const target = evt.target as Window;
  const href = target.location.href;

  // 清除上一次的定时器
  if (popStateTimer) {
    clearTimeout(popStateTimer);
  }

  // 设置新的防抖定时器 (比如 200ms 内只触发一次)
  popStateTimer = globalThis.window.setTimeout(() => {
    console.log("PopState evt", target);
    router.loading(href);
  }, 200);
};
