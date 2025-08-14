import type { PagesRouterInfo } from "@/types/router.ts";
import { check_url,safeURL } from "../core/check_url.ts"
export const WatchClickLink = (router: PagesRouterInfo,event:MouseEvent) => {
    const target = (event.target as HTMLElement).closest("a") as HTMLAnchorElement;
    if (check_url(target)) {
      return;
    }
    const to_url = safeURL(target.href);
    if(to_url==null){
      console.warn("node route error");
      return;
    }
    router.navigate(target.href);
};
