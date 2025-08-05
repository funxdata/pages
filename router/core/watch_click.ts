import { PagesRouterInfo } from "@/types/router.ts";

export const WatchClickLink = (router: PagesRouterInfo) => {
  document.addEventListener("click", (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest("a");

    if (
      target instanceof HTMLAnchorElement &&
      target.href &&
      target.origin === location.origin
    ) {
      event.preventDefault();

      const targetUrl = new URL(target.href);
      const currentUrl = new URL(location.href);

      // 路径和参数都一致，不跳转
      if (
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search
      ) {
        return;
      }

      // 只有路径
      if (target.search==""||target.search==undefined){
        router.navigate(target.pathname);
      }else{
        if(targetUrl.pathname === currentUrl.pathname){
          const rt = router.search(targetUrl.pathname)
          if(rt==null){
            console.warn("loading route error");
            return;
          }
          router.Pagination(rt,target.search)
        }else{
          router.navigate(target.pathname);
          const rt = router.search(targetUrl.pathname)
          if(rt==null){
            console.warn("loading route error");
            return;
          }
          router.Pagination(rt,target.search)
        }
      }
    }
  });
};
