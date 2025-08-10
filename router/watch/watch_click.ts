import type { PagesRouterInfo } from "@/types/router.ts";
import { check_url } from "../core/check_url.ts"
export const WatchClickLink = (router: PagesRouterInfo,event:MouseEvent) => {
    const target = (event.target as HTMLElement).closest("a") as HTMLAnchorElement;
    if (check_url(target)) {
      return;
    }
    router.navigate(target.href);
};
