//  监听url 变化
import { PagesRouterInfo } from "@/types/router.ts";

export const WatchPopState = (router: PagesRouterInfo) => {
  let lastPath = "";      // 记录上一次 pathname
  let lastSearch = "";    // 记录上一次 search 参数

  globalThis.addEventListener("locationchange", () => {
    const currentUrl = new URL(location.href);

    const currentPath = currentUrl.pathname;
    const currentSearch = currentUrl.search;
    if(currentSearch==null||currentSearch==""||currentSearch==undefined){
      return;
    }
    console.log(currentSearch)
    console.log("logging pop state")

    // 如果路径和查询参数都没有变化，则不再处理
    if (currentPath === lastPath && currentSearch === lastSearch) {
      console.warn("重复链接跳转，忽略执行");
      return;
    }

    lastPath = currentPath;
    lastSearch = currentSearch;

    const rt = router.search(currentPath);
    if (rt == null) {
      console.warn("loading route error");
      return;
    }
    rt.load_Pagination();
    router.Pagination(rt, currentSearch);
  });
};
