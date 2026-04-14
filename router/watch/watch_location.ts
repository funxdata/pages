import { PagesRouterInfo } from "@/types/router.ts";

export const WatchLocation = (router: PagesRouterInfo) => {
  globalThis.addEventListener("locationchange", e => {
    console.log("URL location:", e, "→", e);
  });
}