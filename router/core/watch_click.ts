import { PagesRouterInfo } from "@/types/router.ts";

export const WatchClickLink= (router: PagesRouterInfo)=> {
  document.addEventListener("click", (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest("a");
    if (
      target instanceof HTMLAnchorElement &&
      target.href &&
      target.origin === location.origin
    ) {
      event.preventDefault();
      router.navigate(target.pathname);
    }
  });
}