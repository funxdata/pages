import { PagesRouterInfo } from "@/types/router.ts";
export const WatchPopState= (router: PagesRouterInfo)=> {
    globalThis.addEventListener("popstate", () => {
        // const path = globalThis.location.pathname;
        // 触发路由处理逻辑
        // router.navigate(path);
        console.log("......pop")
    });
}
