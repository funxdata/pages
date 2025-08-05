//  监听url 变化
import { PagesRouterInfo } from "@/types/router.ts";

// 启动监听：将 URL 变化交给你的 PagesRouterInfo 实例处理
export const WatchPopState = (router: PagesRouterInfo) => {
  globalThis.addEventListener("locationchange", () => {
    const currentUrl = new URL(location.href);
    const rt = router.search(currentUrl.pathname);
    if(rt==null){
      console.warn("loading route error");
      return;
    }
    router.Pagination(rt,currentUrl.search);
  });
};