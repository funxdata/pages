//  监听页面的替换变化
// PopState 菜单栏左右按键的切换
import type { PagesRouterInfo } from "@/types/router.ts";

export const WatchPopState = (router: PagesRouterInfo,evt:PopStateEvent) => {
  // router.replace(href.toString())
  // console.log(href);
  const target = evt.target as Window;
  console.log("PopState   evt",target);
  router.loading(target.location.href)
};

